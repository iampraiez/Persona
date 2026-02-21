import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";
import { logger } from "../utils/logger.utils";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // 1. Explicitly clear user context to prevent leakage or bypass
  req.user = undefined;

  try {
    // Explicitly check for cookies object and the token string
    const token = req.cookies && typeof req.cookies.access_token === "string" 
      ? req.cookies.access_token 
      : null;

    if (!token) {
      res.status(401).json({ error: "Unauthorized: Missing token", data: null });
      return;
    }

    const payload = verifyAccessToken(token);

    // Strict validation of the payload to satisfy CodeQL's bypass checks
    if (!payload || typeof payload !== "object" || !payload.email || typeof payload.email !== "string") {
      res.status(401).json({ error: "Unauthorized: Invalid or expired token", data: null });
      return;
    }

    // 2. Verified payload - set safe user and proceed
    req.user = payload.email;
    next();
  } catch (error: unknown) {
    logger.error({ err: error }, "Auth Middleware ERROR");
    res.status(401).json({ error: "Unauthorized", data: null });
  }
}
