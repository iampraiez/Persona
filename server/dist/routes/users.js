"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const error_util_1 = require("../utils/error.util");
const logger_utils_1 = require("../utils/logger.utils");
const email_service_1 = require("../services/email.service");
const router = (0, express_1.Router)();
// Generate random 6-digit code
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
router.get("/", async (req, res) => {
    let user;
    try {
        user = await prisma_1.prisma.user.findUnique({
            where: { email: req.user },
            select: {
                email: true,
                name: true,
                image: true,
                createdAt: true,
                events: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        startTime: true,
                        isSpecial: true,
                        isCompleted: true,
                    },
                    orderBy: {
                        startTime: "desc",
                    },
                },
                goals: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        createdAt: true,
                        steps: true,
                        totalDays: true
                    },
                    take: 5,
                    orderBy: {
                        createdAt: "desc",
                    },
                },
                notifications: true,
                aiCredits: true,
                lastAiReset: true,
                cachedInsights: true,
                lastInsightsDate: true,
                notificationsEnabled: true,
                defaultNotifyBefore: true,
            },
        });
        if (!user) {
            res.status(404).json({ data: null, error: "User not found" });
            return;
        }
        // Check for daily reset
        const now = new Date();
        const lastReset = new Date(user.lastAiReset);
        const isNewDay = now.getDate() !== lastReset.getDate() ||
            now.getMonth() !== lastReset.getMonth() ||
            now.getFullYear() !== lastReset.getFullYear();
        if (isNewDay && user) {
            // Reset credits to 3
            logger_utils_1.logger.info(`User: ${JSON.stringify(user)}`);
            logger_utils_1.logger.info(`User: ${req.user}`);
            await prisma_1.prisma.user.update({
                where: { email: req.user },
                data: {
                    aiCredits: 3,
                    lastAiReset: now,
                },
            });
            user.aiCredits = 3; // Update local object for response
        }
        // Check if cached insights are valid (from today)
        let validCachedInsights = null;
        if (user.cachedInsights && user.lastInsightsDate) {
            const lastInsightsDate = new Date(user.lastInsightsDate);
            const isSameDay = now.getDate() === lastInsightsDate.getDate() &&
                now.getMonth() === lastInsightsDate.getMonth() &&
                now.getFullYear() === lastInsightsDate.getFullYear();
            if (isSameDay) {
                validCachedInsights = user.cachedInsights;
            }
        }
        const formattedGoals = user.goals.map(goal => {
            const totalSteps = goal.steps.length;
            const completedSteps = goal.steps.filter((step) => step.isCompleted).length;
            const percentage = totalSteps > 0 ? completedSteps / totalSteps : 0;
            const { steps, ...goalWithoutSteps } = goal;
            return {
                ...goalWithoutSteps,
                percentage
            };
        });
        // Calculate weekly summary
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);
        const weeklyEvents = user.events.filter((event) => {
            const eventDate = new Date(event.startTime);
            return eventDate >= startOfWeek && eventDate <= endOfToday;
        });
        const totalEventsThisWeek = weeklyEvents.length;
        const completedEventsThisWeek = weeklyEvents.filter((e) => e.isCompleted).length;
        const specialEventsThisWeek = weeklyEvents.filter((e) => e.isSpecial).length;
        // Calculate aggregate goal progress
        const aggregateGoalProgress = formattedGoals.length > 0
            ? Math.round(formattedGoals.reduce((sum, goal) => sum + goal.percentage, 0) / formattedGoals.length * 100)
            : 0;
        const weeklySummary = {
            totalEvents: totalEventsThisWeek,
            completedEvents: completedEventsThisWeek,
            specialEvents: specialEventsThisWeek,
            aggregateGoalProgress,
        };
        const responseData = {
            ...user,
            events: user.events.slice(0, 5),
            goals: formattedGoals,
            weeklySummary,
            aiCredits: user.aiCredits,
            cachedInsights: validCachedInsights,
        };
        res.status(200).json({ data: responseData, error: null });
    }
    catch (error) {
        logger_utils_1.logger.error(`Error getting user: ${error}`);
        res.status(500).json({
            data: null,
            error: (0, error_util_1.errorWrapper)(error, "Failed to get user"),
        });
    }
});
router.put("/", async (req, res) => {
    try {
        const { name, image, notificationsEnabled, defaultNotifyBefore } = req.body;
        const dataToUpdate = {
            ...(name !== undefined && { name }),
            ...(image !== undefined && { image }),
            ...(notificationsEnabled !== undefined && { notificationsEnabled }),
            ...(defaultNotifyBefore !== undefined && { defaultNotifyBefore: parseInt(defaultNotifyBefore) }),
        };
        await prisma_1.prisma.user.update({
            where: { email: req.user },
            data: dataToUpdate,
        });
        res.status(200).json({ data: "User updated", error: null });
    }
    catch (error) {
        logger_utils_1.logger.error(`Error updating user: ${error}`);
        res.status(500).json({
            data: null,
            error: (0, error_util_1.errorWrapper)(error, "Failed to update user"),
        });
    }
});
// Request account deletion - send verification code
router.post("/request-delete", async (req, res) => {
    try {
        logger_utils_1.logger.info(`Account deletion requested for user: ${req.user}`);
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: req.user },
        });
        if (!user) {
            logger_utils_1.logger.error(`User not found: ${req.user}`);
            res.status(404).json({ data: null, error: "User not found" });
            return;
        }
        // Generate 6-digit code
        const code = generateCode();
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 5); // 5 minutes from now
        logger_utils_1.logger.info(`Generated deletion code for ${user.email}: ${code}, expires at ${expiry.toISOString()}`);
        // Save code and expiry to database
        await prisma_1.prisma.user.update({
            where: { email: req.user },
            data: {
                deleteAccountCode: code,
                deleteAccountCodeExpiry: expiry,
            },
        });
        logger_utils_1.logger.info(`Saved deletion code to database for ${user.email}`);
        // Send email with code
        try {
            await email_service_1.EmailService.sendDeleteAccountCode(user.email, code);
            logger_utils_1.logger.info(`Email sent successfully to ${user.email}`);
        }
        catch (emailError) {
            logger_utils_1.logger.error(`Failed to send email: ${emailError}`);
            // Continue anyway - code is saved, user can try again
        }
        res.status(200).json({
            data: { message: "Verification code sent to email", expiresAt: expiry.toISOString() },
            error: null
        });
    }
    catch (error) {
        logger_utils_1.logger.error(`Error requesting account deletion: ${error}`);
        res.status(500).json({
            data: null,
            error: (0, error_util_1.errorWrapper)(error, "Failed to request account deletion"),
        });
    }
});
// Verify code and delete account
router.post("/delete-account", async (req, res) => {
    try {
        const { code } = req.body;
        logger_utils_1.logger.info(`Account deletion verification requested for user: ${req.user}`);
        if (!code) {
            logger_utils_1.logger.error(`No code provided`);
            res.status(400).json({ data: null, error: "Verification code required" });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: req.user },
        });
        if (!user) {
            logger_utils_1.logger.error(`User not found: ${req.user}`);
            res.status(404).json({ data: null, error: "User not found" });
            return;
        }
        // Check if code exists and is valid
        if (!user.deleteAccountCode || !user.deleteAccountCodeExpiry) {
            logger_utils_1.logger.error(`No deletion request found for ${user.email}`);
            res.status(400).json({ data: null, error: "No deletion request found. Please request a new code." });
            return;
        }
        logger_utils_1.logger.info(`Code to check: ${code}, Stored code: ${user.deleteAccountCode}`);
        // Check if code matches
        if (user.deleteAccountCode !== code.trim()) {
            logger_utils_1.logger.error(`Invalid code provided. Expected: ${user.deleteAccountCode}, Got: ${code}`);
            res.status(400).json({ data: null, error: "Invalid verification code" });
            return;
        }
        // Check if code is expired
        const now = new Date();
        const expiryDate = new Date(user.deleteAccountCodeExpiry);
        logger_utils_1.logger.info(`Current time: ${now.toISOString()}, Expiry time: ${expiryDate.toISOString()}`);
        if (now > expiryDate) {
            logger_utils_1.logger.error(`Code expired. Now: ${now.toISOString()}, Expiry: ${expiryDate.toISOString()}`);
            res.status(400).json({ data: null, error: "Verification code expired. Please request a new code." });
            return;
        }
        logger_utils_1.logger.info(`Code verified successfully for ${user.email}. Proceeding with account deletion...`);
        // Delete all user data
        // Delete steps first (foreign key constraint)
        await prisma_1.prisma.step.deleteMany({
            where: {
                goal: {
                    userId: user.id,
                },
            },
        });
        // Delete goals
        await prisma_1.prisma.goal.deleteMany({
            where: { userId: user.id },
        });
        // Delete events
        await prisma_1.prisma.event.deleteMany({
            where: { userId: user.id },
        });
        // Delete notifications
        await prisma_1.prisma.notification.deleteMany({
            where: { userId: user.id },
        });
        // Finally, delete user
        await prisma_1.prisma.user.delete({
            where: { id: user.id },
        });
        logger_utils_1.logger.info(`User ${user.email} successfully deleted their account`);
        res.status(200).json({ data: { message: "Account deleted successfully" }, error: null });
    }
    catch (error) {
        logger_utils_1.logger.error(`Error deleting account: ${error}`);
        res.status(500).json({
            data: null,
            error: (0, error_util_1.errorWrapper)(error, "Failed to delete account"),
        });
    }
});
exports.default = router;
