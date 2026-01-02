import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import {
  generateDailyFocus,
  generateEventSuggestions,
  generateGoalSuggestions,
  generateGoalSteps,
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

    // Check for cached insights first (if not forced)
    // Note: Frontend should handle "force" refresh if needed, but for now we assume 
    // if this endpoint is called, we want new insights UNLESS valid cache exists and we want to return it.
    // However, the requirement says "if generated once... it just fetches from there".
    // So we check cache first.
    
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

    // Check credits
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

    // Deduct credit and cache insights
    await prisma.user.update({
      where: { id: user.id },
      data: {
        aiCredits: { decrement: 1 },
        cachedInsights: suggestions as any, // Cast to any for Json compatibility
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

export default router;
