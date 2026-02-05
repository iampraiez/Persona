import { Router } from "express";
import { FeedbackController } from "../controllers/feedback.controller";

const router = Router();

router.post("/", FeedbackController.sendFeedback);

export default router;
