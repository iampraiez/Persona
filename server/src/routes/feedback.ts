import express, { Request, Response } from "express";
import { EmailService } from "../services/email.service";
import { logger } from "../utils/logger.utils";
import { z } from "zod";

const router = express.Router();

const feedbackSchema = z.object({
  message: z.string().min(1, "Message is required").max(2000, "Message is too long"),
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { message } = feedbackSchema.parse(req.body);
    const userEmail = (req as any).user?.email || "Anonymous";

    await EmailService.sendFeedbackEmail(userEmail, message);
    
    res.status(200).json({ data: { success: true }, error: null });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
        res.status(400).json({ data: null, error: error.issues[0].message });
        return;
    }
    logger.error(`Feedback Error: ${error}`);
    res.status(500).json({ data: null, error: "Failed to send feedback" });
  }
});

export default router;
