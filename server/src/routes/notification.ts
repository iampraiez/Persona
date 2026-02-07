import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";

const router = Router();

router.get("/", NotificationController.getAll);
router.delete("/:id", NotificationController.deleteOne);
router.delete("/", NotificationController.deleteAll);
router.put("/", NotificationController.markAllRead);
router.post("/save-subscription", NotificationController.saveSubscription);
router.put("/:id/read", NotificationController.markAsRead);
router.post("/send", NotificationController.send);

export default router;
