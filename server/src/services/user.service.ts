import { prisma } from "../lib/prisma";
import { EmailService } from "./email.service";

export class UserService {
  static async getProfile(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
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
            focusDuration: true,
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
            totalDays: true,
          },
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
        },
        notifications: true,
        aiCredits: true,
        purchasedAiCredits: true,
        lastAiReset: true,
        cachedInsights: true,
        lastInsightsDate: true,
        notificationsEnabled: true,
        defaultNotifyBefore: true,
        deleteAccountCode: true,
        deleteAccountCodeExpiry: true,
      },
    });

    if (!user) return null;

    // Handle Daily Credit Reset
    const now = new Date();
    const lastReset = new Date(user.lastAiReset);
    const isNewDay =
      now.getDate() !== lastReset.getDate() ||
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear();

    if (isNewDay) {
      await prisma.user.update({
        where: { email },
        data: {
          aiCredits: 3,
          lastAiReset: now,
        },
      });
      user.aiCredits = 3;
    }

    // Handle Cached Insights
    let validCachedInsights = null;
    if (user.cachedInsights && user.lastInsightsDate) {
      const lastInsightsDate = new Date(user.lastInsightsDate);
      const isSameDay =
        now.getDate() === lastInsightsDate.getDate() &&
        now.getMonth() === lastInsightsDate.getMonth() &&
        now.getFullYear() === lastInsightsDate.getFullYear();

      if (isSameDay) {
        validCachedInsights = user.cachedInsights;
      }
    }

    // Format goals with percentage
    const formattedGoals = user.goals.map((goal) => {
      const totalSteps = goal.steps.length;
      const completedSteps = goal.steps.filter(
        (step: { isCompleted: boolean }) => step.isCompleted,
      ).length;
      const percentage = totalSteps > 0 ? completedSteps / totalSteps : 0;
      const { steps, ...goalWithoutSteps } = goal;
      return {
        ...goalWithoutSteps,
        percentage,
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

    const aggregateGoalProgress =
      formattedGoals.length > 0
        ? Math.round(
            (formattedGoals.reduce((sum, goal) => sum + goal.percentage, 0) /
              formattedGoals.length) *
              100,
          )
        : 0;

    const weeklySummary = {
      totalEvents: weeklyEvents.length,
      completedEvents: weeklyEvents.filter((e) => e.isCompleted).length,
      specialEvents: weeklyEvents.filter((e) => e.isSpecial).length,
      aggregateGoalProgress,
    };

    const { deleteAccountCode, deleteAccountCodeExpiry, ...safeUser } = user;

    return {
      ...safeUser,
      events: user.events.slice(0, 5),
      goals: formattedGoals,
      weeklySummary,
      aiCredits: user.aiCredits,
      cachedInsights: validCachedInsights,
    };
  }

  static async updateProfile(email: string, data: any) {
    const { name, image, notificationsEnabled, defaultNotifyBefore } = data;
    const dataToUpdate = {
      ...(name !== undefined && { name }),
      ...(image !== undefined && { image }),
      ...(notificationsEnabled !== undefined && { notificationsEnabled }),
      ...(defaultNotifyBefore !== undefined && {
        defaultNotifyBefore: parseInt(defaultNotifyBefore),
      }),
    };
    return prisma.user.update({
      where: { email },
      data: dataToUpdate,
    });
  }

  static async requestDeletion(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 5);

    await prisma.user.update({
      where: { email },
      data: {
        deleteAccountCode: code,
        deleteAccountCodeExpiry: expiry,
      },
    });

    await EmailService.sendDeleteAccountCode(user.email, code);
    return expiry;
  }

  static async deleteAccount(email: string, code: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");

    if (!user.deleteAccountCode || !user.deleteAccountCodeExpiry) {
      throw new Error("No deletion request found. Please request a new code.");
    }

    if (user.deleteAccountCode !== code.trim()) {
      throw new Error("Invalid verification code");
    }

    if (new Date() > new Date(user.deleteAccountCodeExpiry)) {
      throw new Error("Verification code expired. Please request a new code.");
    }

    // Cascade delete via manual logic (as prisma schema might not have all relations marked cascade)
    await prisma.step.deleteMany({
      where: { goal: { userId: user.id } },
    });
    await prisma.goal.deleteMany({
      where: { userId: user.id },
    });
    await prisma.event.deleteMany({
      where: { userId: user.id },
    });
    await prisma.notification.deleteMany({
      where: { userId: user.id },
    });
    return prisma.user.delete({
      where: { id: user.id },
    });
  }
}
