"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = require("./lib/prisma");
const notification_service_1 = require("./services/notification.service");
const logger_utils_1 = require("./utils/logger.utils");
const startScheduler = () => {
    node_cron_1.default.schedule("* * * * *", async () => {
        try {
            const now = new Date();
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
            const upcomingEvents = await prisma_1.prisma.event.findMany({
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
                        const existingNotif = await prisma_1.prisma.notification.findFirst({
                            where: {
                                userId: event.userId,
                                title: title,
                                timestamp: {
                                    gte: new Date(now.getTime() - 5 * 60 * 1000)
                                }
                            }
                        });
                        if (!existingNotif) {
                            await (0, notification_service_1.sendNotification)(event.userId, title, body);
                        }
                    }
                }
                const startTime = event.startTime;
                if (now >= startTime && now < new Date(startTime.getTime() + 60 * 1000)) {
                    if (event.user.notificationsEnabled) {
                        const title = `Event Starting Now: ${event.title}`;
                        const body = `Your event "${event.title}" is starting now.`;
                        const existingNotif = await prisma_1.prisma.notification.findFirst({
                            where: {
                                userId: event.userId,
                                title: title,
                                timestamp: {
                                    gte: new Date(now.getTime() - 5 * 60 * 1000)
                                }
                            }
                        });
                        if (!existingNotif) {
                            await (0, notification_service_1.sendNotification)(event.userId, title, body);
                        }
                    }
                }
            }
        }
        catch (error) {
            logger_utils_1.logger.error(`Scheduler Error: ${error}`);
        }
    });
    logger_utils_1.logger.info("Scheduler started");
};
exports.startScheduler = startScheduler;
