import { type Response, Router, type Request } from "express";
import { prisma } from "../lib/prisma";
import { errorWrapper } from "../utils/error.util";
import { logger } from "../utils/logger.utils";
import { EmailService } from "../services/email.service";

const router: Router = Router();

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.get("/", async (req: Request, res: Response): Promise<void> => {
  let user
  try {
    user = await prisma.user.findUnique({
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

    const now = new Date();
    const lastReset = new Date(user.lastAiReset);
    const isNewDay =
      now.getDate() !== lastReset.getDate() ||
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear();

    if (isNewDay && user) {
      // Reset credits to 3
      await prisma.user.update({
        where: { email: req.user },
        data: {
          aiCredits: 3,
          lastAiReset: now,
        },
      });
      user.aiCredits = 3;
    }

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

    const totalEventsThisWeek = weeklyEvents.length;
    const completedEventsThisWeek = weeklyEvents.filter(
      (e) => e.isCompleted,
    ).length;
    const specialEventsThisWeek = weeklyEvents.filter(
      (e) => e.isSpecial,
    ).length;

    // Calculate aggregate goal progress
    const aggregateGoalProgress =
      formattedGoals.length > 0
        ? Math.round(
            (formattedGoals.reduce((sum, goal) => sum + goal.percentage, 0) /
              formattedGoals.length) *
              100,
          )
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
  } catch (error: unknown) {
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to get user"),
    });
  }
});

router.put("/", async (req: Request, res: Response) => {
  try {
    const { name, image, notificationsEnabled, defaultNotifyBefore } = req.body;
    const dataToUpdate = {
      ...(name !== undefined && { name }),
      ...(image !== undefined && { image }),
      ...(notificationsEnabled !== undefined && { notificationsEnabled }),
      ...(defaultNotifyBefore !== undefined && {
        defaultNotifyBefore: parseInt(defaultNotifyBefore),
      }),
    };
    await prisma.user.update({
      where: { email: req.user },
      data: dataToUpdate,
    });

    res.status(200).json({ data: "User updated", error: null });
  } catch (error: unknown) {
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to update user"),
    });
  }
});

router.post("/request-delete", async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.user },
    });

    if (!user) {
      logger.error(`User not found: ${req.user}`);
      res.status(404).json({ data: null, error: "User not found" });
      return;
    }

    const code = generateCode();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 5);

    logger.info(
      `Generated deletion code for ${user.email}: ${code}, expires at ${expiry.toISOString()}`,
    );

    await prisma.user.update({
      where: { email: req.user },
      data: {
        deleteAccountCode: code,
        deleteAccountCodeExpiry: expiry,
      },
    });

    logger.info(`Saved deletion code to database for ${user.email}`);

    try {
      await EmailService.sendDeleteAccountCode(user.email, code);
      logger.info(`Email sent successfully to ${user.email}`);
    } catch (emailError) {
      logger.error(`Failed to send email: ${emailError}`);
    }

    res.status(200).json({
      data: {
        message: "Verification code sent to email",
        expiresAt: expiry.toISOString(),
      },
      error: null,
    });
  } catch (error: unknown) {
    logger.error(`Error requesting account deletion: ${error}`);
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to request account deletion"),
    });
  }
});

router.post("/delete-account", async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;
    if (!code) {
      logger.error(`No code provided`);
      res.status(400).json({ data: null, error: "Verification code required" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: req.user },
    });

    if (!user) {
      logger.error(`User not found: ${req.user}`);
      res.status(404).json({ data: null, error: "User not found" });
      return;
    }

    if (!user.deleteAccountCode || !user.deleteAccountCodeExpiry) {
      logger.error(`No deletion request found for ${user.email}`);
      res.status(400).json({ data: null, error: "No deletion request found. Please request a new code." });
      return;
    }

    logger.info(`Code to check: ${code}, Stored code: ${user.deleteAccountCode}`);

    // Check if code matches
    if (user.deleteAccountCode !== code.trim()) {
      logger.error(`Invalid code provided. Expected: ${user.deleteAccountCode}, Got: ${code}`);
      res.status(400).json({ data: null, error: "Invalid verification code" });
      return;
    }

    // Check if code is expired
    const now = new Date();
    const expiryDate = new Date(user.deleteAccountCodeExpiry);
    
    logger.info(`Current time: ${now.toISOString()}, Expiry time: ${expiryDate.toISOString()}`);
    
    if (now > expiryDate) {
      logger.error(`Code expired. Now: ${now.toISOString()}, Expiry: ${expiryDate.toISOString()}`);
      res.status(400).json({ data: null, error: "Verification code expired. Please request a new code." });
      return;
    }

    logger.info(`Code verified successfully for ${user.email}. Proceeding with account deletion...`);

    // Delete all user data
    // Delete steps first (foreign key constraint)
    await prisma.step.deleteMany({
      where: {
        goal: {
          userId: user.id,
        },
      },
    });

    // Delete goals
    await prisma.goal.deleteMany({
      where: { userId: user.id },
    });

    // Delete events
    await prisma.event.deleteMany({
      where: { userId: user.id },
    });

    // Delete notifications
    await prisma.notification.deleteMany({
      where: { userId: user.id },
    });

    // Finally, delete user
    await prisma.user.delete({
      where: { id: user.id },
    });

    logger.info(`User ${user.email} successfully deleted their account`);

    res.status(200).json({ data: { message: "Account deleted successfully" }, error: null });
  } catch (error: unknown) {
    logger.error(`Error deleting account: ${error}`);
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to delete account"),
    });
  }
});

export default router;
