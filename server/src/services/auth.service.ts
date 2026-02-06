import { prisma } from "../lib/prisma";
import { createAccessToken, generateRandomToken } from "../utils/jwt.util";
import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env";

const CLIENT_ID = env.data?.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = env.data?.GOOGLE_CLIENT_SECRET;
const URL = env.data?.BACKEND_URL || "http://localhost:3000";
const REDIRECT_URI = `${URL}/api/auth/google/callback`;

export const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);


const isProduction = env.data?.NODE_ENV === "production" && env.data?.CLIENT_URL?.startsWith("https");

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export const ACCESS_TOKEN_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 20 * 60 * 1000,
};

export class AuthService {
  static async getGoogleAuthUrl(returnTo?: string) {
    return oAuth2Client.generateAuthUrl({
      scope: ["profile", "email"],
      access_type: "offline",
      prompt: "consent",
      state: returnTo ? Buffer.from(JSON.stringify({ returnTo })).toString("base64") : undefined,
    });
  }

  static async handleGoogleCallback(code: string) {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const userInfoResponse = await oAuth2Client.request({
      url: "https://www.googleapis.com/oauth2/v3/userinfo",
    });
    const { email, name, picture }: any = userInfoResponse.data;

    const refreshToken = generateRandomToken();
    const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const user = await prisma.user.upsert({
      where: { email: email! },
      update: {
        name: name,
        image: picture,
        refreshToken,
        refreshTokenExpiresAt,
      },
      create: {
        email: email!,
        name: name,
        image: picture,
        refreshToken,
        refreshTokenExpiresAt,
      },
    });

    const accessToken = createAccessToken({
      email: user.email,
      name: user.name!,
      image: user.image!,
    });

    return { accessToken, refreshToken, user };
  }

  static async refreshAccessToken(refreshToken: string) {
    const user = await prisma.user.findUnique({
      where: { refreshToken },
    });

    if (!user || !user.refreshTokenExpiresAt || user.refreshTokenExpiresAt < new Date()) {
      return null;
    }

    const newAccessToken = createAccessToken({
      email: user.email,
      name: user.name!,
      image: user.image!,
    });

    return newAccessToken;
  }

  static async getUserInfo(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        events: true,
        goals: true,
        notifications: true,
      },
    });
  }
}
