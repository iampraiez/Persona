import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";

const router = Router();

router.post("/initialize", PaymentController.initialize);
router.get("/verify/:reference", PaymentController.verify);
router.post("/webhook", PaymentController.webhook);

export default router;
