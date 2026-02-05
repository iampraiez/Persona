import { Router } from "express";
import { GoalController } from "../controllers/goal.controller";

const router = Router();

router.get("/", GoalController.getAll);
router.post("/", GoalController.create);
router.put("/:id", GoalController.update);
router.delete("/:id", GoalController.delete);
router.put("/:id/steps/:stepid", GoalController.completeStep);

export default router;
