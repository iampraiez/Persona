import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger.utils";
import { errorWrapper } from "../utils/error.util";

const router = Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user } });
    if (!user) {
      res.status(404).json({ error: "User not found", data: null });
      return;
    }

    const goals = await prisma.goal.findMany({
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
  } catch (error: unknown) {
    logger.error(`Get Goals Error: ${error}`);
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to get goals"),
    });
  }
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user } });
    if (!user) {
      res.status(404).json({ error: "User not found", data: null });
      return;
    }
    const { title, description, totalDays, createdAt, steps } = req.body;
    const steps_edited = steps.map(({ id, ...rest }) => ({ ...rest }));
    const newGoal = await prisma.goal.create({
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
  } catch (error: unknown) {
    logger.error(`Create Goal Error: ${error}`);
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to create goal"),
    });
  }
});

router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user } });
    if (!user) {
      res.status(404).json({ error: "User not found", data: null });
      return;
    }

    const { id } = req.params;
    const { title, description, totalDays, steps } = req.body;

    const goal = await prisma.goal.findFirst({
      where: { id, userId: user.id },
    });

    if (!goal) {
      res.status(404).json({ error: "Goal not found", data: null });
      return;
    }

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (totalDays !== undefined) updateData.totalDays = totalDays;

    // Handle steps update if provided
    if (steps !== undefined && Array.isArray(steps)) {
      // Delete all existing steps and recreate them
      await prisma.step.deleteMany({
        where: { goalId: id },
      });

      // Create new steps (don't include goalId - Prisma sets it automatically via relation)
      // Also filter out unknown fields like skippedIsImportant which might be coming from frontend
      const stepsToCreate = steps.map(({ title, description, dueDate, isCompleted }: any) => ({
        title,
        description,
        dueDate,
        isCompleted: isCompleted || false,
      }));

      updateData.steps = {
        create: stepsToCreate,
      };
    }

    const updatedGoal = await prisma.goal.update({
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
  } catch (error: unknown) {
    logger.error(`Update Goal Error: ${error}`);
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to update goal"),
    });
  }
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user } });
    if (!user) {
      res.status(404).json({ error: "User not found", data: null });
      return;
    }

    const { id } = req.params;

    const goal = await prisma.goal.findFirst({
      where: { id, userId: user.id },
    });

    if (!goal) {
      res.status(404).json({ error: "Goal not found", data: null });
      return;
    }

    // Delete associated steps first to avoid foreign key constraint
    await prisma.step.deleteMany({
      where: { goalId: id },
    });

    // Then delete the goal
    await prisma.goal.delete({
      where: { id },
    });

    res.status(200).json({ data: "Goal deleted successfully", error: null });
  } catch (error: unknown) {
    logger.error(`Delete Goal Error: ${error}`);
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to delete goal"),
    });
  }
});

router.put(
  "/:id/steps/:stepid",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, stepid } = req.params;

      const updatedStep = await prisma.step.update({
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
    } catch (error: unknown) {
      logger.error(`Edit step error: ${error}`);
      res.status(500).json({
        data: null,
        error: errorWrapper(error, "Failed to update step"),
      });
    }
  }
);

export default router;
