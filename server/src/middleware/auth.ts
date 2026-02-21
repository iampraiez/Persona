import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";
import { logger, sanitizeLog } from "../utils/logger.utils";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // 1. Explicitly clear user to prevent potential bypasses or leaks from previous middleware
  req.user = undefined;

  try {
    const token = req.cookies?.access_token;

    if (!token) {
      res.status(401).json({ error: "Unauthorized: Missing token", data: null });
      return;
    }

    const payload = verifyAccessToken(token);

    if (!payload || typeof payload !== "object" || !payload.email) {
      res.status(401).json({ error: "Unauthorized: Invalid or expired token", data: null });
      return;
    }

    // 2. Verified payload - set user and proceed
    req.user = payload.email;
    next();
  } catch (error: unknown) {
    logger.error({ err: error }, "Auth Middleware Error");
    res.status(401).json({ error: "Unauthorized", data: null });
  }
}
