import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger.utils";
import { errorWrapper } from "../utils/error.util";

const router = Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user } });
    if (!user) {
      res.status(404).json({ error: "User not found", data: null });
      return;
    }

    const events = await prisma.event.findMany({
      where: { userId: user.id },
      orderBy: { startTime: "asc" },
    });
    res.status(200).json({ data: events, error: null });
  } catch (error: unknown) {
    logger.error(`Get Events Error: ${error}`);
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to get events"),
    });
  }
});

router.get("/upcoming", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user } });
    if (!user) {
      res.status(404).json({ error: "User not found", data: null });
      return;
    }

    const now = new Date();
    const next24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const events = await prisma.event.findMany({
      where: {
        userId: user.id,
        startTime: {
          gte: now,
          lte: next24Hours,
        },
      },
      orderBy: { startTime: "asc" },
      take: 8,
    });

    res.status(200).json({ data: events, error: null });
  } catch (error: unknown) {
    logger.error(`Get Upcoming Events Error: ${error}`);
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to get upcoming events"),
    });
  }
});

router.get("/date", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user } });
    if (!user) {
      res.status(404).json({ error: "User not found", data: null });
      return;
    }

    const { date, view } = req.query;
    const dateObj = date ? new Date(date as string) : new Date();

    let startDate: Date;
    let endDate: Date;

    if (view === "week") {
      const day = dateObj.getDay();
      startDate = new Date(dateObj);
      startDate.setDate(dateObj.getDate() - day);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(dateObj);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(dateObj);
      endDate.setHours(23, 59, 59, 999);
    }

    const events = await prisma.event.findMany({
      where: {
        userId: user.id,
        startTime: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: { startTime: "asc" },
    });

    res.status(200).json({ data: events, error: null });
  } catch (error: unknown) {
    logger.error(`Get Events by Date Error: ${error}`);
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to get events"),
    });
  }
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user } });
    if (!user) {
      res.status(404).json({ error: "User not found", data: null });
      return;
    }

    const { title, description, startTime, endTime, notifyBefore } = req.body;

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        notifyBefore: notifyBefore !== undefined ? parseInt(notifyBefore) : user.defaultNotifyBefore,
        userId: user.id,
      },
    });

    res.status(201).json({ data: newEvent, error: null });
  } catch (error: unknown) {
    logger.error(`Create Event Error: ${error}`);
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to create event"),
    });
  }
});

router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user } });
    if (!user) {
      res.status(404).json({ error: "User not found", data: null });
      return;
    }

    const { id } = req.params;
    const {
      title,
      description,
      startTime,
      endTime,
      isCompleted,
      skippedIsImportant,
      skippedReason,
    } = req.body;

    const event = await prisma.event.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!event) {
      res.status(404).json({ error: "Event not found", data: null });
      return;
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        isCompleted,
        skippedIsImportant,
        skippedReason,
      },
    });

    res.status(200).json({ data: updatedEvent, error: null });
  } catch (error: unknown) {
    logger.error(`Update Event Error: ${error}`);
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to update event"),
    });
  }
});

router.put("/:id/skip", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user } });
    if (!user) {
      res.status(404).json({ error: "User not found", data: null });
      return;
    }

    const { id } = req.params;
    const { skippedReason, skippedIsImportant } = req.body;

    const event = await prisma.event.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!event) {
      res.status(404).json({ error: "Event not found", data: null });
      return;
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        isCompleted: false,
        skippedReason,
        skippedIsImportant,
        isSpecial: skippedIsImportant,
      },
    });

    res.status(200).json({ data: updatedEvent, error: null });
  } catch (error: unknown) {
    logger.error(`Skip Event Error: ${error}`);
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to skip event"),
    });
  }
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user } });
    if (!user) {
      res.status(404).json({ error: "User not found", data: null });
      return;
    }

    const { id } = req.params;

    const event = await prisma.event.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!event) {
      res.status(404).json({ error: "Event not found", data: null });
      return;
    }

    await prisma.event.delete({
      where: { id },
    });

    res.status(200).json({ data: "Event deleted successfully", error: null });
  } catch (error: unknown) {
    logger.error(`Delete Event Error: ${error}`);
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to delete event"),
    });
  }
});

router.delete("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user } });
    if (!user) {
      res.status(404).json({ error: "User not found", data: null });
      return;
    }

    const { start, end } = req.query;

    if (!start || !end) {
      res.status(400).json({ error: "Start and end dates are required", data: null });
      return;
    }

    await prisma.event.deleteMany({
      where: {
        userId: user.id,
        startTime: {
          gte: new Date(start as string),
          lte: new Date(end as string),
        },
      },
    });

    res.status(200).json({ data: "Events deleted successfully", error: null });
  } catch (error: unknown) {
    logger.error(`Delete Events Range Error: ${error}`);
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to delete events"),
    });
  }
});

router.post("/copy", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user } });
    if (!user) {
      res.status(404).json({ error: "User not found", data: null });
      return;
    }

    const { sourceStart, sourceEnd, targetStart } = req.body;

    if (!sourceStart || !sourceEnd || !targetStart) {
      res.status(400).json({ error: "Missing required fields", data: null });
      return;
    }

    const sStart = new Date(sourceStart);
    const sEnd = new Date(sourceEnd);
    const tStart = new Date(targetStart);

    // Normalize times for accurate diff calculation (optional, but good for day alignment)
    // We keep hours if the user wants exact copy, but usually "copy day" means same time on new day.
    // However, if it's a range, we just want to shift everything by the difference.
    
    const timeDiff = tStart.getTime() - sStart.getTime();

    // Get source events
    const events = await prisma.event.findMany({
      where: {
        userId: user.id,
        startTime: {
          gte: sStart,
          lte: sEnd,
        },
      },
    });

    if (events.length === 0) {
       res.status(200).json({ data: [], error: null }); 
       return;
    }

    // Create new events
    const newEvents = await Promise.all(
      events.map((event) =>
        prisma.event.create({
          data: {
            title: event.title,
            description: event.description,
            startTime: new Date(event.startTime.getTime() + timeDiff),
            endTime: new Date(event.endTime.getTime() + timeDiff),
            notifyBefore: event.notifyBefore,
            userId: user.id,
          },
        })
      )
    );

    res.status(201).json({ data: newEvents, error: null });

  } catch (error: unknown) {
    logger.error(`Copy Events Error: ${error}`);
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to copy events"),
    });
  }
});

export default router;
