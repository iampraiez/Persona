import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const router: Router = Router();

router.get("/", UserController.getProfile);
router.put("/", UserController.updateProfile);
router.post("/request-delete", UserController.requestDelete);
router.post("/delete-account", UserController.deleteAccount);

export default router;
