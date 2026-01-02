"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = void 0;
const web_push_1 = __importDefault(require("web-push"));
const prisma_1 = require("../lib/prisma");
const logger_utils_1 = require("../utils/logger.utils");
const env_1 = require("../config/env");
const publicVapidKey = env_1.env.data?.VAPID_PUBLIC_KEY;
const privateVapidKey = env_1.env.data?.VAPID_PRIVATE_KEY;
if (publicVapidKey && privateVapidKey) {
    web_push_1.default.setVapidDetails("mailto:example@yourdomain.org", publicVapidKey, privateVapidKey);
}
else {
    logger_utils_1.logger.warn("VAPID keys are missing. Push notifications will not work.");
}
const sendNotification = async (userId, title, body) => {
    try {
        const notification = await prisma_1.prisma.notification.create({
            data: { userId, title, body },
        });
        const subscriptionRecord = await prisma_1.prisma.pushSubscription.findFirst({
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
            await web_push_1.default.sendNotification(subscription, JSON.stringify({ title, body, id: notification.id }));
            logger_utils_1.logger.info(`Notification sent to user ${userId}`);
        }
        else {
            logger_utils_1.logger.info(`No push subscription found for user ${userId}`);
        }
        return notification;
    }
    catch (error) {
        logger_utils_1.logger.error(`Error sending notification to user ${userId}: ${error}`);
        return null;
    }
};
exports.sendNotification = sendNotification;
