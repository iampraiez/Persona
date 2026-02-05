import { Request, Response } from "express";
import { AiService } from "../services/ai.service";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger.utils";
import { errorWrapper } from "../utils/error.util";

export class AiController {
  private static async getUserId(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return user.id;
  }

  static async getSuggestions(req: Request, res: Response) {
    try {
      const userId = await AiController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      const suggestions = await AiService.getSuggestions(userId);
      res.status(200).json({ data: suggestions, error: null });
    } catch (error: any) {
      logger.error(`AI Suggestions Error: ${error.message}`);
      res.status(error.message.includes("Limit") ? 403 : 500).json({
        data: null,
        error: errorWrapper(error, error.message || "Failed to generate AI suggestions")
      });
    }
  }

  static async generateGoalSteps(req: Request, res: Response) {
    try {
      const userId = await AiController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      const steps = await AiService.generateGoalSteps(userId, req.body);
      res.status(200).json({ data: { steps }, error: null });
    } catch (error: any) {
      logger.error(`Step Generation Error: ${error.message}`);
      res.status(error.message.includes("Limit") ? 403 : 500).json({
        data: null,
        error: errorWrapper(error, error.message || "Failed to generate steps")
      });
    }
  }

  static async generateTimetable(req: Request, res: Response) {
    try {
      const userId = await AiController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      const createdEvents = await AiService.generateTimetable(userId, req.body);
      res.status(200).json({ data: createdEvents, error: null });
    } catch (error: any) {
      logger.error(`Timetable Generation Error: ${error.message}`);
      res.status(error.message.includes("Limit") ? 403 : 500).json({
        data: null,
        error: errorWrapper(error, error.message || "Failed to generate timetable")
      });
    }
  }
}
