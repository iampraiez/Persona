import { prisma } from "../lib/prisma";
import { toUTCDate } from "../utils/date.util";

export class GoalService {
  static async getUserGoals(userId: string) {
    return prisma.goal.findMany({
      where: { userId },
      include: {
        steps: {
          orderBy: {
            dueDate: "asc",
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createGoal(userId: string, data: { title: string; description?: string; totalDays: number; createdAt: string; steps: { title: string; description?: string; dueDate: string }[] }) {
    const { title, description, totalDays, createdAt, steps } = data;
    const steps_edited = steps.map(({ dueDate, ...rest }: { title: string; description?: string; dueDate: string }) => ({
      ...rest,
      dueDate: toUTCDate(dueDate),
    }));

    return prisma.goal.create({
      data: {
        title,
        description,
        totalDays,
        createdAt: toUTCDate(createdAt) || new Date(),
        userId,
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
  }

  static async updateGoal(userId: string, goalId: string, data: { title?: string; description?: string; totalDays?: number; steps?: { title: string; description?: string; dueDate: string; isCompleted?: boolean }[] }) {
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) throw new Error("Goal not found");

    const { title, description, totalDays, steps } = data;
    const updateData: {
      title?: string;
      description?: string;
      totalDays?: number;
      steps?: { create: { title: string; description?: string; dueDate: Date; isCompleted: boolean }[] };
    } = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (totalDays !== undefined) updateData.totalDays = totalDays;

    if (steps !== undefined && Array.isArray(steps)) {
      await prisma.step.deleteMany({
        where: { goalId },
      });

      const stepsToCreate = steps.map(
        ({ title, description, dueDate, isCompleted }: { title: string; description?: string; dueDate: string; isCompleted?: boolean }) => ({
          title,
          description,
          dueDate: toUTCDate(dueDate),
          isCompleted: isCompleted || false,
        }),
      );

      updateData.steps = {
        create: stepsToCreate,
      };
    }

    return prisma.goal.update({
      where: { id: goalId },
      data: updateData,
      include: {
        steps: {
          orderBy: {
            dueDate: "asc",
          },
        },
      },
    });
  }

  static async deleteGoal(userId: string, goalId: string) {
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) throw new Error("Goal not found");

    await prisma.step.deleteMany({
      where: { goalId },
    });

    return prisma.goal.delete({
      where: { id: goalId },
    });
  }

  static async completeStep(goalId: string, stepId: string) {
    return prisma.step.update({
      where: {
        goalId,
        id: stepId,
      },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });
  }
}
