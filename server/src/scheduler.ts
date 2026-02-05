import cron from "node-cron";
import { prisma } from "./lib/prisma";
import { NotificationService } from "./services/notification.service";
import { logger } from "./utils/logger.utils";

export const startScheduler = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
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
               await NotificationService.sendNotification(event.userId, title, body);
             }
           }
        }

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
               await NotificationService.sendNotification(event.userId, title, body);
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
