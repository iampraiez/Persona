import { Request, Response } from "express";
import { AnalyticsService } from "../services/analytics.service";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger.utils";
import { errorWrapper } from "../utils/error.util";

export class AnalyticsController {
  private static async getUserId(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return user.id;
  }

  static async getAnalytics(req: Request, res: Response) {
    try {
      const userId = await AnalyticsController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      const { range, date } = req.query;
      const currentDate = date ? new Date(date as string) : new Date();

      const data = await AnalyticsService.getAnalytics(userId, range as string, currentDate);
      res.status(200).json({ data, error: null });
    } catch (error: unknown) {
      logger.error(`Get Analytics Error: ${error}`);
      res.status(500).json({
        data: null,
        error: errorWrapper(error, "Failed to get analytics"),
      });
    }
  }
}
