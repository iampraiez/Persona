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

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: "desc" },
    });

    res.status(200).json({ data: notifications, error: null });
  } catch (error: unknown) {
    logger.error(`Get Notifications Error: ${error}`);
    res.status(500).json({ 
      data: null, 
      error: errorWrapper(error, "Failed to get notifications") 
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

    const notification = await prisma.notification.findFirst({
      where: { id: id as string, userId: user.id },
    });

    if (!notification) {
      res.status(404).json({ error: "Notification not found", data: null });
      return;
    }

    await prisma.notification.delete({
      where: { id: id as string },
    });

    res.status(200).json({ data: "Notification deleted successfully", error: null });
  } catch (error: unknown) {
    logger.error(`Delete Notification Error: ${error}`);
    res.status(500).json({ 
      data: null, 
      error: errorWrapper(error, "Failed to delete notification") 
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

    await prisma.notification.deleteMany({
      where: { userId: user.id },
    });

    res.status(200).json({ data: "All notifications deleted successfully", error: null });
  } catch (error: unknown) {
    logger.error(`Delete All Notifications Error: ${error}`);
    res.status(500).json({ 
      data: null, 
      error: errorWrapper(error, "Failed to delete all notifications") 
    });
  }
});

router.post("/save-subscription",async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user } });
    if (!user) {
      res.status(404).json({ error: "User not found", data: null });
      return;
    }

    const { subscription } = req.body;
    const sub = JSON.parse(subscription);

    await prisma.pushSubscription.upsert({
      where: { endpoint: sub.endpoint },
      update: {
        auth: sub.keys.auth,
        p256dh: sub.keys.p256dh,
        userId: user.id,
      },
      create: {
        endpoint: sub.endpoint,
        auth: sub.keys.auth,
        p256dh: sub.keys.p256dh,
        userId: user.id,
      },
    });

    res.status(200).json({ data: "Subscription saved", error: null });
  } catch (error: unknown) {
    logger.error(`Save Subscription Error: ${error}`);
    res.status(500).json({ 
      data: null, 
      error: errorWrapper(error, "Failed to save subscription") 
    });
  }
});

router.put("/:id/read", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user } });
    if (!user) {
      res.status(404).json({ error: "User not found", data: null });
      return;
    }

    const { id } = req.params;

    await prisma.notification.update({
      where: { id: id as string, userId: user.id },
      data: { isRead: true },
    });

    res.status(200).json({ data: "Notification marked as read", error: null });
  } catch (error: unknown) {
    logger.error(`Mark Read Error: ${error}`);
    res.status(500).json({ 
      data: null, 
      error: errorWrapper(error, "Failed to mark notification as read") 
    });
  }
});

router.post("/send", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user } });
    if (!user) {
      res.status(404).json({ error: "User not found", data: null });
      return;
    }

    const { title, body } = req.body;

    // Create notification record
    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        title,
        body,
      },
    });

    // Try to send push notification
    const { sendNotification } = await import("../services/notification.service");
    await sendNotification(user.id, title, body);

    res.status(200).json({ data: notification, error: null });
  } catch (error: unknown) {
    logger.error(`Send Notification Error: ${error}`);
    res.status(500).json({ 
      data: null, 
      error: errorWrapper(error, "Failed to send notification") 
    });
  }
});

export default router;
