import { Router } from "express";
import rateLimit from "express-rate-limit";
import { PaymentController } from "../controllers/payment.controller";

const router = Router();

// Strict rate limit on payment endpoints: 10 requests per 15 minutes per IP
const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many payment requests, please try again later.",
    data: null,
  },
});

router.use(paymentRateLimiter);
router.post("/initialize", PaymentController.initialize);
router.get("/verify/:reference", PaymentController.verify);
router.post("/webhook", PaymentController.webhook);

export default router;
