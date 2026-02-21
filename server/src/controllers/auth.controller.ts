import { Request, Response } from "express";
import { AuthService, COOKIE_OPTIONS, ACCESS_TOKEN_OPTIONS } from "../services/auth.service";
import { logger } from "../utils/logger.utils";
import { errorWrapper } from "../utils/error.util";
import { env } from "../config/env";

const FRONTEND_URL = env.data?.CLIENT_URL || "http://localhost:5173";

/**
 * Validates returnTo against the allowed frontend origin.
 * Returns FRONTEND_URL if returnTo is unsafe or malformed.
 */
function validateReturnTo(returnTo: string | undefined): string {
  if (!returnTo) return FRONTEND_URL;

  // Allow relative paths (e.g., /dashboard)
  // Ensure it starts with / but not // (which is a protocol-relative URL)
  if (returnTo.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }

  // If it's an absolute URL, verify it matches our frontend origin exactly
  try {
    const url = new URL(returnTo);
    const allowed = new URL(FRONTEND_URL);
    if (url.origin === allowed.origin) {
      return returnTo;
    }
  } catch {
    // Malformed URL
  }

  return FRONTEND_URL;
}

export class AuthController {
  static async googleAuth(req: Request, res: Response) {
    try {
      const returnTo = req.query.returnTo as string;
      const authUrl = await AuthService.getGoogleAuthUrl(returnTo);
      res.json({ data: authUrl, error: null });
    } catch (error: unknown) {
      logger.error({ err: error }, "Google Auth: failed to get auth url");
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
        const decodedState = JSON.parse(
          Buffer.from(state as string, "base64").toString(),
        );
        returnTo = validateReturnTo(decodedState.returnTo);
      } catch {
        logger.error("Failed to parse OAuth state parameter");
      }
    }

    if (!code) return res.redirect(`${returnTo}/login?error=auth_failed`);

    try {
      const { accessToken, refreshToken } =
        await AuthService.handleGoogleCallback(code as string);

      res.cookie("access_token", accessToken, ACCESS_TOKEN_OPTIONS);
      res.cookie("refresh_token", refreshToken, COOKIE_OPTIONS);

      const safeRedirect = String(`${returnTo}/login?success=true`);
      return res.redirect(safeRedirect);
    } catch (error: unknown) {
      logger.error({ err: error }, "Google Auth: callback processing failed");
      const errorRedirect = String(`${returnTo}/login?error=auth_failed`);
      return res.redirect(errorRedirect);
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
        return res
          .status(401)
          .json({ data: null, error: "Invalid or expired refresh token" });
      }

      res.cookie("access_token", newAccessToken, ACCESS_TOKEN_OPTIONS);
      res.status(200).json({ data: true, error: null });
    } catch (error: unknown) {
      logger.error({ err: error }, "Refresh Error");
      res.status(500).json({ data: null, error: "Failed to refresh token" });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      res.clearCookie("access_token", ACCESS_TOKEN_OPTIONS);
      res.clearCookie("refresh_token", COOKIE_OPTIONS);
      res.status(200).json({ data: true, error: null });
    } catch (error: unknown) {
      logger.error({ err: error }, "Logout Error");
      res.status(500).json({
        data: null,
        error: errorWrapper(error, "Failed to logout"),
      });
    }
  }
}
