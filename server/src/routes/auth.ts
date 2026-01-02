import { type Request, type Response, Router } from "express";
import { logger } from "../utils/logger.utils";
import { errorWrapper } from "../utils/error.util";
import { AuthService, COOKIE_OPTIONS, ACCESS_TOKEN_OPTIONS } from "../services/auth.service";
import { env } from "../config/env";

const router: Router = Router();
const FRONTEND_URL = env.data?.CLIENT_URL || "http://localhost:5173";

router.get("/google", async (req: Request, res: Response): Promise<void> => {
  try {
    const authUrl = await AuthService.getGoogleAuthUrl();
    res.json({ data: authUrl, error: null });
  } catch (error: unknown) {
    logger.error(`Google Auth Error: ${error}`);
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to get auth url"),
    });
  }
});

router.get(
  "/google/callback",
  async (req: Request, res: Response): Promise<void> => {
    const { code } = req.query;
    if (!code) return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);

    try {
      const { accessToken, refreshToken } = await AuthService.handleGoogleCallback(code as string);

      res.cookie("access_token", accessToken, ACCESS_TOKEN_OPTIONS);
      res.cookie("refresh_token", refreshToken, COOKIE_OPTIONS);

      return res.redirect(`${FRONTEND_URL}/login?success=true`);
    } catch (error: unknown) {
      logger.error(`Google Auth Error: ${error}`);
      return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

router.get("/refresh", async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      res.status(401).json({ data: null, error: "No refresh token" });
      return;
    }

    const newAccessToken = await AuthService.refreshAccessToken(refreshToken);
    if (!newAccessToken) {
      res.status(401).json({ data: null, error: "Invalid or expired refresh token" });
      return;
    }

    res.cookie("access_token", newAccessToken, ACCESS_TOKEN_OPTIONS);
    res.status(200).json({ data: true, error: null });
  } catch (error: unknown) {
    logger.error(`Refresh Error: ${error}`);
    res.status(500).json({ data: null, error: "Failed to refresh token" });
  }
});

router.get("/logout", async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.status(200).json({ data: true, error: null });
  } catch (error: unknown) {
    logger.error(`Logout Error: ${error}`);
    res.status(500).json({
      data: null,
      error: errorWrapper(error, "Failed to logout"),
    });
  }
});

export default router;
