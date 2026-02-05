import webpush from "web-push";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger.utils";
import { env } from "../config/env";

const publicVapidKey = env.data?.VAPID_PUBLIC_KEY;
const privateVapidKey = env.data?.VAPID_PRIVATE_KEY;

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(
    "mailto:timeforge@persona.app",
    publicVapidKey,
    privateVapidKey
  );
} else {
  logger.warn("VAPID keys are missing. Push notifications will not work.");
}

export class NotificationService {
  static async sendNotification(userId: string, title: string, body: string) {
    try {
      const notification = await prisma.notification.create({
        data: { userId, title, body },
      });

      const subscriptionRecord = await prisma.pushSubscription.findFirst({
        where: { userId },
      });

      if (subscriptionRecord) {
        const subscription = {
          endpoint: subscriptionRecord.endpoint,
          keys: {
            auth: subscriptionRecord.auth,
            p256dh: subscriptionRecord.p256dh,
          },
        };

        await webpush.sendNotification(
          subscription,
          JSON.stringify({ title, body, id: notification.id })
        );
        logger.info(`Notification sent to user ${userId}`);
      }

      return notification;
    } catch (error: any) {
      logger.error(`Error sending notification to user ${userId}: ${error.message}`);
      return null;
    }
  }

  static async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
    });
  }

  static async deleteNotification(userId: string, id: string) {
    const notification = await prisma.notification.findFirst({
        where: { id, userId }
    });
    if (!notification) throw new Error("Notification not found");
    
    return prisma.notification.delete({ where: { id } });
  }

  static async deleteAllNotifications(userId: string) {
    return prisma.notification.deleteMany({ where: { userId } });
  }

  static async saveSubscription(userId: string, subscription: any) {
    const sub = typeof subscription === 'string' ? JSON.parse(subscription) : subscription;
    return prisma.pushSubscription.upsert({
      where: { endpoint: sub.endpoint },
      update: {
        auth: sub.keys.auth,
        p256dh: sub.keys.p256dh,
        userId,
      },
      create: {
        endpoint: sub.endpoint,
        auth: sub.keys.auth,
        p256dh: sub.keys.p256dh,
        userId,
      },
    });
  }

  static async markAsRead(userId: string, id: string) {
    return prisma.notification.update({
      where: { id, userId },
      data: { isRead: true },
    });
  }
}
