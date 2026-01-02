import webpush from "web-push";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger.utils";
import { env } from "../config/env";

const publicVapidKey = env.data?.VAPID_PUBLIC_KEY;
const privateVapidKey = env.data?.VAPID_PRIVATE_KEY;

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(
    "mailto:example@yourdomain.org",
    publicVapidKey,
    privateVapidKey
  );
} else {
  logger.warn("VAPID keys are missing. Push notifications will not work.");
}

export const sendNotification = async (
  userId: string,
  title: string,
  body: string
) => {
  try {
    const notification = await prisma.notification.create({
      data: {userId,title, body},
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
    } else {
      logger.info(`No push subscription found for user ${userId}`);
    }

    return notification;
  } catch (error) {
    logger.error(`Error sending notification to user ${userId}: ${error}`);
    return null;
  }
};
