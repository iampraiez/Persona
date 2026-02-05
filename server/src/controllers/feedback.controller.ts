import { Request, Response } from "express";
import { FeedbackService } from "../services/feedback.service";
import { logger } from "../utils/logger.utils";
import { z } from "zod";

const feedbackSchema = z.object({
  message: z.string().min(1, "Message is required").max(2000, "Message is too long"),
});

export class FeedbackController {
  static async sendFeedback(req: Request, res: Response) {
    try {
      const { message } = feedbackSchema.parse(req.body);
      const userEmail = req.user || "Anonymous";

      await FeedbackService.sendFeedback(userEmail as string, message);
      res.status(200).json({ data: { success: true }, error: null });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ data: null, error: error.issues[0].message });
      }
      logger.error(`Feedback Error: ${error}`);
      res.status(500).json({ data: null, error: "Failed to send feedback" });
    }
  }
}
