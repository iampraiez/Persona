import { Request, Response } from "express";
import { AuthService, COOKIE_OPTIONS, ACCESS_TOKEN_OPTIONS } from "../services/auth.service";
import { logger } from "../utils/logger.utils";
import { errorWrapper } from "../utils/error.util";
import { env } from "../config/env";

const FRONTEND_URL = env.data?.CLIENT_URL || "http://localhost:5173";

export class AuthController {
  static async googleAuth(req: Request, res: Response) {
    try {
      const returnTo = req.query.returnTo as string;
      const authUrl = await AuthService.getGoogleAuthUrl(returnTo);
      res.json({ data: authUrl, error: null });
    } catch (error: unknown) {
      logger.error(`Google Auth Error: ${error}`);
      res.status(500).json({
        data: null,
        error: errorWrapper(error, "Failed to get auth url"),
      });
    }
  }

  static async googleCallback(req: Request, res: Response) {
    const { code, state } = req.query;
    let returnTo = FRONTEND_URL;

    if (state) {
      try {
        const decodedState = JSON.parse(Buffer.from(state as string, "base64").toString());
        if (decodedState.returnTo) {
          returnTo = decodedState.returnTo;
        }
      } catch (e) {
        logger.error(`Failed to parse state: ${e}`);
      }
    }

    if (!code) return res.redirect(`${returnTo}/login?error=auth_failed`);

    try {
      const { accessToken, refreshToken } = await AuthService.handleGoogleCallback(code as string);

      res.cookie("access_token", accessToken, ACCESS_TOKEN_OPTIONS);
      res.cookie("refresh_token", refreshToken, COOKIE_OPTIONS);

      return res.redirect(`${returnTo}/login?success=true`);
    } catch (error: unknown) {
      logger.error(`Google Auth Error: ${error}`);
      return res.redirect(`${returnTo}/login?error=auth_failed`);
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refresh_token;
      if (!refreshToken) {
        return res.status(401).json({ data: null, error: "No refresh token" });
      }

      const newAccessToken = await AuthService.refreshAccessToken(refreshToken);
      if (!newAccessToken) {
        return res.status(401).json({ data: null, error: "Invalid or expired refresh token" });
      }

      res.cookie("access_token", newAccessToken, ACCESS_TOKEN_OPTIONS);
      res.status(200).json({ data: true, error: null });
    } catch (error: unknown) {
      logger.error(`Refresh Error: ${error}`);
      res.status(500).json({ data: null, error: "Failed to refresh token" });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      res.clearCookie("access_token", ACCESS_TOKEN_OPTIONS);
      res.clearCookie("refresh_token", COOKIE_OPTIONS);
      res.status(200).json({ data: true, error: null });
    } catch (error: unknown) {
      logger.error(`Logout Error: ${error}`);
      res.status(500).json({
        data: null,
        error: errorWrapper(error, "Failed to logout"),
      });
    }
  }
}
