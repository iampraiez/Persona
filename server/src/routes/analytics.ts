import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller";

const router = Router();

router.get("/", AnalyticsController.getAnalytics);

export default router;
