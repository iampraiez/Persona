import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "random-ass-secret";
const JWT_EXPIRY = "3d";

export interface JWTPayload {
  email: string;
  name: string;
  image: string;
}

export function createToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
