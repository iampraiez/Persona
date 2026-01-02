import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";

const JWT_SECRET = env.data?.JWT_SECRET || "random-ass-secret";
const ACCESS_TOKEN_EXPIRY = "15m";

export interface JWTPayload {
  email: string;
  name: string;
  image: string;
}

export function createAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function generateRandomToken(): string {
  return crypto.randomBytes(40).toString("hex");
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
