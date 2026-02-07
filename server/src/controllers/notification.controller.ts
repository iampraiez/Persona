import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger.utils";
import { errorWrapper } from "../utils/error.util";

export class NotificationController {
  private static async getUserId(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return user.id;
  }

  static async getAll(req: Request, res: Response) {
    try {
      const userId = await NotificationController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      const notifications = await NotificationService.getUserNotifications(userId);
      res.status(200).json({ data: notifications, error: null });
    } catch (error: unknown) {
      logger.error(`Get Notifications Error: ${error}`);
      res.status(500).json({ data: null, error: errorWrapper(error, "Failed to get notifications") });
    }
  }

  static async deleteOne(req: Request, res: Response) {
    try {
      const userId = await NotificationController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      const { id } = req.params;
      await NotificationService.deleteNotification(userId, id as string);
      res.status(200).json({ data: "Notification deleted successfully", error: null });
    } catch (error: any) {
      logger.error(`Delete Notification Error: ${error.message}`);
      res.status(500).json({ data: null, error: errorWrapper(error, "Failed to delete notification") });
    }
  }

  static async deleteAll(req: Request, res: Response) {
    try {
      const userId = await NotificationController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      await NotificationService.deleteAllNotifications(userId);
      res.status(200).json({ data: "All notifications deleted successfully", error: null });
    } catch (error: unknown) {
      logger.error(`Delete All Notifications Error: ${error}`);
      res.status(500).json({ data: null, error: errorWrapper(error, "Failed to delete all notifications") });
    }
  }

  static async saveSubscription(req: Request, res: Response) {
    try {
      const userId = await NotificationController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      const { subscription } = req.body;
      await NotificationService.saveSubscription(userId, subscription);
      res.status(200).json({ data: "Subscription saved", error: null });
    } catch (error: unknown) {
      logger.error(`Save Subscription Error: ${error}`);
      res.status(500).json({ data: null, error: errorWrapper(error, "Failed to save subscription") });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const userId = await NotificationController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      const { id } = req.params;
      await NotificationService.markAsRead(userId, id as string);
      res.status(200).json({ data: "Notification marked as read", error: null });
    } catch (error: unknown) {
      logger.error(`Mark Read Error: ${error}`);
      res.status(500).json({ data: null, error: errorWrapper(error, "Failed to mark notification as read") });
    }
  }

  static async markAllRead(req: Request, res: Response) {
    try {
      const userId = await NotificationController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      await NotificationService.markAllAsRead(userId);
      res.status(200).json({ data: "All notifications marked as read", error: null });
    } catch (error: unknown) {
      logger.error(`Mark All Read Error: ${error}`);
      res.status(500).json({ data: null, error: errorWrapper(error, "Failed to mark all notifications as read") });
    }
  }

  static async send(req: Request, res: Response) {
    try {
      const userId = await NotificationController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      const { title, body } = req.body;
      const notification = await NotificationService.sendNotification(userId, title, body);
      res.status(200).json({ data: notification, error: null });
    } catch (error: unknown) {
      logger.error(`Send Notification Error: ${error}`);
      res.status(500).json({ data: null, error: errorWrapper(error, "Failed to send notification") });
    }
  }
}
