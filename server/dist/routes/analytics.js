"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const logger_utils_1 = require("../utils/logger.utils");
const error_util_1 = require("../utils/error.util");
const date_fns_1 = require("date-fns");
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({ where: { email: req.user } });
        if (!user) {
            res.status(404).json({ error: "User not found", data: null });
            return;
        }
        const { range, date } = req.query;
        const currentDate = date ? new Date(date) : new Date();
        let startDate;
        let endDate;
        // Determine date range
        switch (range) {
            case "day":
                startDate = (0, date_fns_1.startOfDay)(currentDate);
                endDate = (0, date_fns_1.endOfDay)(currentDate);
                break;
            case "week":
                startDate = (0, date_fns_1.startOfWeek)(currentDate, { weekStartsOn: 0 }); // Sunday start
                endDate = (0, date_fns_1.endOfWeek)(currentDate, { weekStartsOn: 0 });
                break;
            case "month":
                startDate = (0, date_fns_1.startOfMonth)(currentDate);
                endDate = (0, date_fns_1.endOfMonth)(currentDate);
                break;
            case "year":
                startDate = (0, date_fns_1.startOfYear)(currentDate);
                endDate = (0, date_fns_1.endOfYear)(currentDate);
                break;
            case "all":
                startDate = new Date(0); // Beginning of time
                endDate = new Date(); // Now
                break;
            default:
                // Default to week
                startDate = (0, date_fns_1.startOfWeek)(currentDate, { weekStartsOn: 0 });
                endDate = (0, date_fns_1.endOfWeek)(currentDate, { weekStartsOn: 0 });
        }
        // Fetch events within range
        const events = await prisma_1.prisma.event.findMany({
            where: {
                userId: user.id,
                startTime: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { startTime: "asc" },
        });
        // Fetch goals (all goals, as they are long-running)
        const goals = await prisma_1.prisma.goal.findMany({
            where: { userId: user.id },
            include: { steps: true },
        });
        // Calculate Statistics
        const totalEvents = events.length;
        const completedEvents = events.filter((e) => e.isCompleted).length;
        const completionRate = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;
        // Calculate Focus Time (hours)
        const focusTime = events.reduce((acc, curr) => {
            if (curr.startTime && curr.endTime && curr.isCompleted) {
                const duration = (new Date(curr.endTime).getTime() - new Date(curr.startTime).getTime()) / (1000 * 60 * 60);
                return acc + duration;
            }
            return acc;
        }, 0);
        // Special Events (Skipped)
        const specialEvents = events.filter((e) => e.isSpecial);
        const skippedReasons = specialEvents.reduce((acc, curr) => {
            const reason = curr.skippedReason || "Unknown";
            acc[reason] = (acc[reason] || 0) + 1;
            return acc;
        }, {});
        const specialEventsData = Object.entries(skippedReasons).map(([name, value]) => ({ name, value }));
        // Activity Data (Bar Chart)
        let activityData = [];
        if (range === "day") {
            // Hourly breakdown
            const hours = Array.from({ length: 24 }, (_, i) => i);
            activityData = hours.map(h => {
                const hourEvents = events.filter(e => new Date(e.startTime).getHours() === h);
                return {
                    name: `${h}:00`,
                    completed: hourEvents.filter(e => e.isCompleted).length,
                    skipped: hourEvents.filter(e => e.isSpecial).length,
                    total: hourEvents.length
                };
            });
        }
        else if (range === "week") {
            // Daily breakdown
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            activityData = days.map((day, index) => {
                const dayEvents = events.filter(e => new Date(e.startTime).getDay() === index);
                return {
                    name: day,
                    completed: dayEvents.filter(e => e.isCompleted).length,
                    skipped: dayEvents.filter(e => e.isSpecial).length,
                    total: dayEvents.length
                };
            });
        }
        else if (range === "month") {
            // Weekly breakdown (approximate) or Daily
            // Let's do daily for month view
            const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
            activityData = Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dayEvents = events.filter(e => new Date(e.startTime).getDate() === day);
                return {
                    name: `${day}`,
                    completed: dayEvents.filter(e => e.isCompleted).length,
                    skipped: dayEvents.filter(e => e.isSpecial).length,
                    total: dayEvents.length
                };
            });
        }
        else if (range === "year") {
            // Monthly breakdown
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            activityData = months.map((month, index) => {
                const monthEvents = events.filter(e => new Date(e.startTime).getMonth() === index);
                return {
                    name: month,
                    completed: monthEvents.filter(e => e.isCompleted).length,
                    skipped: monthEvents.filter(e => e.isSpecial).length,
                    total: monthEvents.length
                };
            });
        }
        else {
            // All time - Yearly breakdown? Or just summary. Let's do Yearly for now if "all"
            // Group by year
            const years = [...new Set(events.map(e => new Date(e.startTime).getFullYear()))].sort();
            activityData = years.map(year => {
                const yearEvents = events.filter(e => new Date(e.startTime).getFullYear() === year);
                return {
                    name: `${year}`,
                    completed: yearEvents.filter(e => e.isCompleted).length,
                    skipped: yearEvents.filter(e => e.isSpecial).length,
                    total: yearEvents.length
                };
            });
        }
        // Goal Progress
        const goalProgressData = goals.map((goal) => {
            // Filter steps that were completed within the selected range
            const completedStepsInRange = goal.steps.filter((s) => {
                if (!s.isCompleted || !s.completedAt)
                    return false;
                const completedAt = new Date(s.completedAt);
                return completedAt >= startDate && completedAt <= endDate;
            }).length;
            // Progress is based on steps completed IN THIS RANGE vs Total Steps
            // This might be confusing if total steps is static. 
            // User asked for "goal progress for that particular time frame".
            // So if I did 2 steps this week out of 10 total, my progress for this week is 20%.
            const progress = goal.steps.length > 0 ? Math.round((completedStepsInRange / goal.steps.length) * 100) : 0;
            return {
                id: goal.id,
                name: goal.title,
                progress,
            };
        });
        const averageGoalProgress = goalProgressData.length > 0
            ? Math.round(goalProgressData.reduce((acc, curr) => acc + curr.progress, 0) / goalProgressData.length)
            : 0;
        res.status(200).json({
            data: {
                totalEvents,
                completedEvents,
                completionRate,
                focusTime: focusTime.toFixed(1),
                specialEventsCount: specialEvents.length,
                specialEventsData,
                activityData,
                goalProgressData,
                averageGoalProgress,
                range: {
                    start: startDate,
                    end: endDate
                }
            },
            error: null,
        });
    }
    catch (error) {
        logger_utils_1.logger.error(`Get Analytics Error: ${error}`);
        res.status(500).json({
            data: null,
            error: (0, error_util_1.errorWrapper)(error, "Failed to get analytics"),
        });
    }
});
exports.default = router;
