import cron from "node-cron";
import { prisma } from "./lib/prisma";
import { sendNotification } from "./services/notification.service";
import { logger } from "./utils/logger.utils";

export const startScheduler = () => {
  // Check for upcoming events every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const nextMinute = new Date(now.getTime() + 60 * 1000);

      // Find events starting within the next minute + notifyBefore minutes
      // We want to find events where startTime - notifyBefore == now (approx)
      // Or rather, startTime is between now + notifyBefore and now + notifyBefore + 1 min

      // Let's simplify: Find events where startTime is in the future,
      // and (startTime - now) is close to notifyBefore minutes.
      
      // Better approach:
      // Find events that haven't been notified yet (we might need a flag, but for now let's rely on time window)
      // To avoid duplicate notifications, we can check if a notification already exists for this event?
      // Or just rely on the tight time window.
      
      // Let's look for events starting between [now + notifyBefore, now + notifyBefore + 1 minute]
      
      // Since notifyBefore is per event, we can't filter easily in DB query for all events with different notifyBefore.
      // But we can query events starting in the next 24 hours (or 1 hour) and filter in memory?
      // Or, if most events have default 15 mins, we can optimize.
      
      // Let's try to query events starting in the next hour and check their specific notifyBefore.
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      
      const upcomingEvents = await prisma.event.findMany({
        where: {
          startTime: {
            gte: new Date(now.getTime() - 5 * 60 * 1000), // Include events that just started
            lte: oneHourLater,
          },
          isCompleted: false,
        },
        include: {
          user: true,
        },
      });

      for (const event of upcomingEvents) {
        // 1. Check for "Upcoming" notification (before event)
        const upcomingNotifyTime = new Date(event.startTime.getTime() - event.notifyBefore * 60 * 1000);
        if (now >= upcomingNotifyTime && now < new Date(upcomingNotifyTime.getTime() + 60 * 1000)) {
           if (event.user.notificationsEnabled) {
             const title = `Upcoming Event: ${event.title}`;
             const body = `Your event starts in ${event.notifyBefore} minutes.`;
             
             const existingNotif = await prisma.notification.findFirst({
               where: {
                 userId: event.userId,
                 title: title,
                 timestamp: {
                   gte: new Date(now.getTime() - 5 * 60 * 1000)
                 }
               }
             });
             
             if (!existingNotif) {
               await sendNotification(event.userId, title, body);
             }
           }
        }

        // 2. Check for "Starting Now" notification
        const startTime = event.startTime;
        if (now >= startTime && now < new Date(startTime.getTime() + 60 * 1000)) {
           if (event.user.notificationsEnabled) {
             const title = `Event Starting Now: ${event.title}`;
             const body = `Your event "${event.title}" is starting now.`;
             
             const existingNotif = await prisma.notification.findFirst({
               where: {
                 userId: event.userId,
                 title: title,
                 timestamp: {
                   gte: new Date(now.getTime() - 5 * 60 * 1000)
                 }
               }
             });
             
             if (!existingNotif) {
               await sendNotification(event.userId, title, body);
             }
           }
        }
      }
      
    } catch (error) {
      logger.error(`Scheduler Error: ${error}`);
    }
  });
  
  logger.info("Scheduler started");
};
