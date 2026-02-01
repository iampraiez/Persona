import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import {
  generateDailyFocus,
  generateEventSuggestions,
  generateGoalSuggestions,
  generateGoalSteps,
  generateTimetable,
} from "../services/ai.service";
import { logger } from "../utils/logger.utils";
import { errorWrapper } from "../utils/error.util";

const router = Router();

router.get("/suggestions", async (req: Request, res: Response): Promise<void> => {
  try {
    const userEmail = req.user;
    
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      res.status(404).json({ error: "User not found", data: null });
      return;
    }

    const now = new Date();
    if (user.cachedInsights && user.lastInsightsDate) {
      const lastInsightsDate = new Date(user.lastInsightsDate);
      const isSameDay =
        now.getDate() === lastInsightsDate.getDate() &&
        now.getMonth() === lastInsightsDate.getMonth() &&
        now.getFullYear() === lastInsightsDate.getFullYear();
      
      if (isSameDay) {
        res.status(200).json({ data: user.cachedInsights, error: null });
        return;
      }
    }

    if (user.aiCredits <= 0) {
      res.status(403).json({ error: "Daily AI limit reached (3/3)", data: null });
      return;
    }

    const userId = user.id;
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const events = await prisma.event.findMany({
      where: {
        userId,
        startTime: {
          gte: now,
          lte: tomorrow,
        },
      },
      orderBy: { startTime: "asc" },
      take: 5,
    });

    const goals = await prisma.goal.findMany({
      where: {
        userId,
      },
      include: {
        steps: true,
      },
      take: 5,
    });

    const scheduleSuggestions = await generateEventSuggestions(events);
    const goalSuggestions = await generateGoalSuggestions(goals);
    const focusSuggestions = await generateDailyFocus(events, goals);

    const suggestions = [
      ...(scheduleSuggestions || []),
      ...(goalSuggestions || []),
      ...(focusSuggestions || []),
    ];

    await prisma.user.update({
      where: { id: user.id },
      data: {
        aiCredits: { decrement: 1 },
        cachedInsights: suggestions as any, 
        lastInsightsDate: now,
      },
    });

    res.status(200).json({ data: suggestions, error: null });
  } catch (error: unknown) {
    logger.error(`AI Suggestions Error: ${error}`);
    res.status(500).json({ 
      data: null, 
      error: errorWrapper(error, "Failed to generate AI suggestions") 
    });
  }
});

router.post("/optimize-schedule", async (req: Request, res: Response): Promise<void> => {
  try {
    const { events } = req.body;

    const suggestions = await generateEventSuggestions(events);

    res.status(200).json({ data: { suggestions }, error: null });
  } catch (error: unknown) {
    logger.error(`Schedule Optimization Error: ${error}`);
    res.status(500).json({ 
      data: null, 
      error: errorWrapper(error, "Failed to optimize schedule") 
    });
  }
});

router.post("/generate-steps",  async (req: Request, res: Response): Promise<void> => {
  try {
    const userEmail = req.user;
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      res.status(404).json({ error: "User not found", data: null });
      return;
    }

    // Check credits
    if (user.aiCredits <= 0) {
      res.status(403).json({ error: "Daily AI limit reached (3/3)", data: null });
      return;
    }

    const { goal, totalDays, stepCount, currentSteps } = req.body;

    const steps = await generateGoalSteps(goal, totalDays, stepCount, currentSteps);

    // Deduct credit
    await prisma.user.update({
      where: { id: user.id },
      data: {
        aiCredits: { decrement: 1 },
      },
    });

    res.status(200).json({ data: { steps }, error: null });
  } catch (error: unknown) {
    logger.error(`Step Generation Error: ${error}`);
    res.status(500).json({ 
      data: null, 
      error: errorWrapper(error, "Failed to generate steps") 
    });
  }
});



router.post("/generate-timetable", async (req: Request, res: Response): Promise<void> => {
  try {
    const userEmail = req.user;
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      res.status(404).json({ error: "User not found", data: null });
      return;
    }

    if (user.aiCredits <= 0) {
      res.status(403).json({ error: "Daily AI limit reached (3/3)", data: null });
      return;
    }

    const { description, range } = req.body;
    if (!description || !range?.start || !range?.end) {
      res.status(400).json({ error: "Missing required fields", data: null });
      return;
    }

    const generatedEvents = await generateTimetable(description, range);
    
    if (!generatedEvents || !Array.isArray(generatedEvents)) {
       res.status(500).json({ error: "Failed to generate valid timetable", data: null });
       return;
    }

    const createdEvents = await Promise.all(
      generatedEvents.map((event: any) =>
        prisma.event.create({
          data: {
            title: event.title,
            description: event.description,
            startTime: new Date(event.startTime),
            endTime: new Date(event.endTime),
            notifyBefore: event.notifyBefore || 15,
            userId: user.id,
          },
        })
      )
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        aiCredits: { decrement: 1 },
      },
    });

    res.status(200).json({ data: createdEvents, error: null });

  } catch (error: unknown) {
    logger.error(`Timetable Generation Error: ${error}`);
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to generate timetable"),
    });
  }
});

export default router;
