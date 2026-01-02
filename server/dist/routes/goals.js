"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const logger_utils_1 = require("../utils/logger.utils");
const error_util_1 = require("../utils/error.util");
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({ where: { email: req.user } });
        if (!user) {
            res.status(404).json({ error: "User not found", data: null });
            return;
        }
        const goals = await prisma_1.prisma.goal.findMany({
            where: { userId: user.id },
            include: {
                steps: {
                    orderBy: {
                        dueDate: "asc",
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json({ data: goals, error: null });
    }
    catch (error) {
        logger_utils_1.logger.error(`Get Goals Error: ${error}`);
        res.status(500).json({
            data: null,
            error: (0, error_util_1.errorWrapper)(error, "Failed to get goals"),
        });
    }
});
router.post("/", async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({ where: { email: req.user } });
        if (!user) {
            res.status(404).json({ error: "User not found", data: null });
            return;
        }
        const { title, description, totalDays, createdAt, steps } = req.body;
        const steps_edited = steps.map(({ id, ...rest }) => ({ ...rest }));
        const newGoal = await prisma_1.prisma.goal.create({
            data: {
                title,
                description,
                totalDays,
                createdAt,
                userId: user.id,
                steps: {
                    create: steps_edited,
                },
            },
            include: {
                steps: {
                    orderBy: {
                        dueDate: "asc",
                    },
                },
            },
        });
        res.status(201).json({ data: newGoal, error: null });
    }
    catch (error) {
        logger_utils_1.logger.error(`Create Goal Error: ${error}`);
        res.status(500).json({
            data: null,
            error: (0, error_util_1.errorWrapper)(error, "Failed to create goal"),
        });
    }
});
router.put("/:id", async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({ where: { email: req.user } });
        if (!user) {
            res.status(404).json({ error: "User not found", data: null });
            return;
        }
        const { id } = req.params;
        const { title, description, totalDays, steps } = req.body;
        const goal = await prisma_1.prisma.goal.findFirst({
            where: { id, userId: user.id },
        });
        if (!goal) {
            res.status(404).json({ error: "Goal not found", data: null });
            return;
        }
        // Prepare update data
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        if (totalDays !== undefined)
            updateData.totalDays = totalDays;
        // Handle steps update if provided
        if (steps !== undefined && Array.isArray(steps)) {
            // Delete all existing steps and recreate them
            await prisma_1.prisma.step.deleteMany({
                where: { goalId: id },
            });
            // Create new steps (don't include goalId - Prisma sets it automatically via relation)
            // Also filter out unknown fields like skippedIsImportant which might be coming from frontend
            const stepsToCreate = steps.map(({ title, description, dueDate, isCompleted }) => ({
                title,
                description,
                dueDate,
                isCompleted: isCompleted || false,
            }));
            updateData.steps = {
                create: stepsToCreate,
            };
        }
        const updatedGoal = await prisma_1.prisma.goal.update({
            where: { id },
            data: updateData,
            include: {
                steps: {
                    orderBy: {
                        dueDate: "asc",
                    },
                },
            },
        });
        res.status(200).json({ data: updatedGoal, error: null });
    }
    catch (error) {
        logger_utils_1.logger.error(`Update Goal Error: ${error}`);
        res.status(500).json({
            data: null,
            error: (0, error_util_1.errorWrapper)(error, "Failed to update goal"),
        });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({ where: { email: req.user } });
        if (!user) {
            res.status(404).json({ error: "User not found", data: null });
            return;
        }
        const { id } = req.params;
        const goal = await prisma_1.prisma.goal.findFirst({
            where: { id, userId: user.id },
        });
        if (!goal) {
            res.status(404).json({ error: "Goal not found", data: null });
            return;
        }
        // Delete associated steps first to avoid foreign key constraint
        await prisma_1.prisma.step.deleteMany({
            where: { goalId: id },
        });
        // Then delete the goal
        await prisma_1.prisma.goal.delete({
            where: { id },
        });
        res.status(200).json({ data: "Goal deleted successfully", error: null });
    }
    catch (error) {
        logger_utils_1.logger.error(`Delete Goal Error: ${error}`);
        res.status(500).json({
            data: null,
            error: (0, error_util_1.errorWrapper)(error, "Failed to delete goal"),
        });
    }
});
router.put("/:id/steps/:stepid", async (req, res) => {
    try {
        const { id, stepid } = req.params;
        const updatedStep = await prisma_1.prisma.step.update({
            where: {
                goalId: id,
                id: stepid,
            },
            data: {
                isCompleted: true,
                completedAt: new Date()
            },
        });
        res.status(200).json({ data: updatedStep, error: null });
    }
    catch (error) {
        logger_utils_1.logger.error(`Edit step error: ${error}`);
        res.status(500).json({
            data: null,
            error: (0, error_util_1.errorWrapper)(error, "Failed to update step"),
        });
    }
});
exports.default = router;
