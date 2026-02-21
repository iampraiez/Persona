import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";
import { logger, sanitizeLog } from "../utils/logger.utils";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Ensure we start with no user to prevent potential bypasses
  (req as any).user = undefined;

  try {
    if (!req.cookies || !req.cookies.access_token) {
      res.status(401).json({ error: "Unauthorized", data: null });
      return;
    }

    const token = req.cookies.access_token;
    const payload = verifyAccessToken(token);

    if (!payload || !payload.email) {
      res.status(401).json({ error: "Token expired or invalid", data: null });
      return;
    }

    req.user = payload.email;
    next();
  } catch (error: unknown) {
    logger.error(sanitizeLog(`Auth Error: ${error instanceof Error ? error.message : String(error)}`));
    res.status(401).json({ error: "Unauthorized", data: null });
  }
}
