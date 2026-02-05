import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router: Router = Router();

router.get("/google", AuthController.googleAuth);
router.get("/google/callback", AuthController.googleCallback);
router.get("/refresh", AuthController.refresh);
router.get("/logout", AuthController.logout);

export default router;
