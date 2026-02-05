import { Router } from "express";
import { AiController } from "../controllers/ai.controller";

const router = Router();

router.get("/suggestions", AiController.getSuggestions);
router.post("/generate-steps", AiController.generateGoalSteps);
router.post("/generate-timetable", AiController.generateTimetable);

export default router;
