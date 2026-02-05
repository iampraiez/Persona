import { Router } from "express";
import { EventController } from "../controllers/event.controller";

const router = Router();

router.get("/", EventController.getAll);
router.get("/upcoming", EventController.getUpcoming);
router.get("/date", EventController.getByDate);
router.post("/", EventController.create);
router.put("/:id", EventController.update);
router.put("/:id/skip", EventController.skip);
router.delete("/:id", EventController.deleteOne);
router.delete("/", EventController.deleteRange);
router.post("/copy", EventController.copy);

export default router;
