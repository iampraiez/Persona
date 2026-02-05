import { Request, Response } from "express";
import { GoalService } from "../services/goal.service";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger.utils";
import { errorWrapper } from "../utils/error.util";

export class GoalController {
  private static async getUserId(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return user.id;
  }

  static async getAll(req: Request, res: Response) {
    try {
      const userId = await GoalController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      const goals = await GoalService.getUserGoals(userId);
      res.status(200).json({ data: goals, error: null });
    } catch (error: unknown) {
      logger.error(`Get Goals Error: ${error}`);
      res.status(500).json({ data: null, error: errorWrapper(error, "Failed to get goals") });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const userId = await GoalController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      const newGoal = await GoalService.createGoal(userId, req.body);
      res.status(201).json({ data: newGoal, error: null });
    } catch (error: unknown) {
      logger.error(`Create Goal Error: ${error}`);
      res.status(500).json({ data: null, error: errorWrapper(error, "Failed to create goal") });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const userId = await GoalController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      const { id } = req.params;
      const updatedGoal = await GoalService.updateGoal(userId, id as string, req.body);
      res.status(200).json({ data: updatedGoal, error: null });
    } catch (error: any) {
      logger.error(`Update Goal Error: ${error.message}`);
      res.status(500).json({ data: null, error: errorWrapper(error, "Failed to update goal") });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const userId = await GoalController.getUserId(req.user as string);
      if (!userId) return res.status(404).json({ error: "User not found", data: null });

      const { id } = req.params;
      await GoalService.deleteGoal(userId, id as string);
      res.status(200).json({ data: "Goal deleted successfully", error: null });
    } catch (error: any) {
      logger.error(`Delete Goal Error: ${error.message}`);
      res.status(500).json({ data: null, error: errorWrapper(error, "Failed to delete goal") });
    }
  }

  static async completeStep(req: Request, res: Response) {
    try {
      const { id, stepid } = req.params;
      const updatedStep = await GoalService.completeStep(id as string, stepid as string);
      res.status(200).json({ data: updatedStep, error: null });
    } catch (error: any) {
      logger.error(`Complete Step Error: ${error.message}`);
      res.status(500).json({ data: null, error: errorWrapper(error, "Failed to update step") });
    }
  }
}
