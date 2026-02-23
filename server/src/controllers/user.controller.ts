import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { logger } from "../utils/logger.utils";
import { errorWrapper } from "../utils/error.util";

export class UserController {
  static async getProfile(req: Request, res: Response) {
    try {
      const user = await UserService.getProfile(req.user as string);
      if (!user) {
        return res.status(404).json({ data: null, error: "User not found" });
      }
      res.status(200).json({ data: user, error: null });
    } catch (error: unknown) {
      res.status(500).json({
        data: null,
        error: errorWrapper(error, "Failed to get user"),
      });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      await UserService.updateProfile(req.user as string, req.body);
      res.status(200).json({ data: "User updated", error: null });
    } catch (error: unknown) {
      res.status(500).json({
        data: null,
        error: errorWrapper(error, "Failed to update user"),
      });
    }
  }

  static async requestDelete(req: Request, res: Response) {
    try {
      const expiry = await UserService.requestDeletion(req.user as string);
      res.status(200).json({
        data: {
          message: "Verification code sent to email",
          expiresAt: expiry.toISOString(),
        },
        error: null,
      });
    } catch (error: unknown) {
      logger.error(
        `Error requesting account deletion: ${error instanceof Error ? error.message : String(error)}`,
      );
      res.status(500).json({
        data: null,
        error: errorWrapper(
          error,
          error instanceof Error
            ? error.message
            : "Failed to request account deletion",
        ),
      });
    }
  }

  static async deleteAccount(req: Request, res: Response) {
    try {
      const { code } = req.body;
      if (!code) {
        return res
          .status(400)
          .json({ data: null, error: "Verification code required" });
      }

      // Fire and forget account deletion
      UserService.deleteAccount(req.user as string, code).catch((err) => {
        logger.error(
          `Background account deletion failed for ${req.user}: ${err instanceof Error ? err.message : String(err)}`,
        );
      });

      res.status(200).json({
        data: { message: "Account deletion started" },
        error: null,
      });
    } catch (error: unknown) {
      logger.error(
        `Error deleting account: ${error instanceof Error ? error.message : String(error)}`,
      );
      res.status(500).json({
        data: null,
        error: errorWrapper(
          error,
          error instanceof Error ? error.message : "Failed to delete account",
        ),
      });
    }
  }

  static async exportData(req: Request, res: Response) {
    try {
      const result = await UserService.exportData(req.user as string);
      res.status(200).json({ data: result, error: null });
    } catch (error: unknown) {
      logger.error(`Export Error: ${error}`);
      res.status(500).json({
        data: null,
        error: errorWrapper(error, "Failed to export data"),
      });
    }
  }
}
