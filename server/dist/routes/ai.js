"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const ai_service_1 = require("../services/ai.service");
const logger_utils_1 = require("../utils/logger.utils");
const error_util_1 = require("../utils/error.util");
const router = (0, express_1.Router)();
router.get("/suggestions", async (req, res) => {
    try {
        const userEmail = req.user;
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: userEmail },
        });
        if (!user) {
            res.status(404).json({ error: "User not found", data: null });
            return;
        }
        // Check for cached insights first (if not forced)
        // Note: Frontend should handle "force" refresh if needed, but for now we assume 
        // if this endpoint is called, we want new insights UNLESS valid cache exists and we want to return it.
        // However, the requirement says "if generated once... it just fetches from there".
        // So we check cache first.
        const now = new Date();
        if (user.cachedInsights && user.lastInsightsDate) {
            const lastInsightsDate = new Date(user.lastInsightsDate);
            const isSameDay = now.getDate() === lastInsightsDate.getDate() &&
                now.getMonth() === lastInsightsDate.getMonth() &&
                now.getFullYear() === lastInsightsDate.getFullYear();
            if (isSameDay) {
                res.status(200).json({ data: user.cachedInsights, error: null });
                return;
            }
        }
        // Check credits
        if (user.aiCredits <= 0) {
            res.status(403).json({ error: "Daily AI limit reached (3/3)", data: null });
            return;
        }
        const userId = user.id;
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);
        const events = await prisma_1.prisma.event.findMany({
            where: {
                userId,
                startTime: {
                    gte: now,
                    lte: tomorrow,
                },
            },
            orderBy: { startTime: "asc" },
            take: 5,
        });
        const goals = await prisma_1.prisma.goal.findMany({
            where: {
                userId,
            },
            include: {
                steps: true,
            },
            take: 5,
        });
        const scheduleSuggestions = await (0, ai_service_1.generateEventSuggestions)(events);
        const goalSuggestions = await (0, ai_service_1.generateGoalSuggestions)(goals);
        const focusSuggestions = await (0, ai_service_1.generateDailyFocus)(events, goals);
        const suggestions = [
            ...(scheduleSuggestions || []),
            ...(goalSuggestions || []),
            ...(focusSuggestions || []),
        ];
        // Deduct credit and cache insights
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                aiCredits: { decrement: 1 },
                cachedInsights: suggestions, // Cast to any for Json compatibility
                lastInsightsDate: now,
            },
        });
        res.status(200).json({ data: suggestions, error: null });
    }
    catch (error) {
        logger_utils_1.logger.error(`AI Suggestions Error: ${error}`);
        res.status(500).json({
            data: null,
            error: (0, error_util_1.errorWrapper)(error, "Failed to generate AI suggestions")
        });
    }
});
router.post("/optimize-schedule", async (req, res) => {
    try {
        const { events } = req.body;
        const suggestions = await (0, ai_service_1.generateEventSuggestions)(events);
        res.status(200).json({ data: { suggestions }, error: null });
    }
    catch (error) {
        logger_utils_1.logger.error(`Schedule Optimization Error: ${error}`);
        res.status(500).json({
            data: null,
            error: (0, error_util_1.errorWrapper)(error, "Failed to optimize schedule")
        });
    }
});
router.post("/generate-steps", async (req, res) => {
    try {
        const userEmail = req.user;
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: userEmail },
        });
        if (!user) {
            res.status(404).json({ error: "User not found", data: null });
            return;
        }
        // Check credits
        if (user.aiCredits <= 0) {
            res.status(403).json({ error: "Daily AI limit reached (3/3)", data: null });
            return;
        }
        const { goal, totalDays, stepCount, currentSteps } = req.body;
        const steps = await (0, ai_service_1.generateGoalSteps)(goal, totalDays, stepCount, currentSteps);
        // Deduct credit
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                aiCredits: { decrement: 1 },
            },
        });
        res.status(200).json({ data: { steps }, error: null });
    }
    catch (error) {
        logger_utils_1.logger.error(`Step Generation Error: ${error}`);
        res.status(500).json({
            data: null,
            error: (0, error_util_1.errorWrapper)(error, "Failed to generate steps")
        });
    }
});
exports.default = router;
