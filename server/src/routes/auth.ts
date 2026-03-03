import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authRateLimiter } from "../middleware/rateLimiter";

const router: Router = Router();

router.get("/google", authRateLimiter, AuthController.googleAuth);
router.get("/google/callback", authRateLimiter, AuthController.googleCallback);
router.get("/refresh", AuthController.refresh);
router.get("/logout", AuthController.logout);

export default router;
