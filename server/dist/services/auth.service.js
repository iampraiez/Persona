"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = exports.ACCESS_TOKEN_OPTIONS = exports.COOKIE_OPTIONS = exports.oAuth2Client = void 0;
const prisma_1 = require("../lib/prisma");
const jwt_util_1 = require("../utils/jwt.util");
const google_auth_library_1 = require("google-auth-library");
const env_1 = require("../config/env");
const CLIENT_ID = env_1.env.data?.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = env_1.env.data?.GOOGLE_CLIENT_SECRET;
const URL = env_1.env.data?.BACKEND_URL || "http://localhost:3000";
const REDIRECT_URI = `${URL}/api/auth/google/callback`;
exports.oAuth2Client = new google_auth_library_1.OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
exports.COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env_1.env.data?.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
};
exports.ACCESS_TOKEN_OPTIONS = {
    ...exports.COOKIE_OPTIONS,
    maxAge: 20 * 60 * 1000,
};
class AuthService {
    static async getGoogleAuthUrl() {
        return exports.oAuth2Client.generateAuthUrl({
            scope: ["profile", "email"],
            access_type: "offline",
            prompt: "consent",
        });
    }
    static async handleGoogleCallback(code) {
        const { tokens } = await exports.oAuth2Client.getToken(code);
        exports.oAuth2Client.setCredentials(tokens);
        const userInfoResponse = await exports.oAuth2Client.request({
            url: "https://www.googleapis.com/oauth2/v3/userinfo",
        });
        const { email, name, picture } = userInfoResponse.data;
        const refreshToken = (0, jwt_util_1.generateRandomToken)();
        const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const user = await prisma_1.prisma.user.upsert({
            where: { email: email },
            update: {
                name: name,
                image: picture,
                refreshToken,
                refreshTokenExpiresAt,
            },
            create: {
                email: email,
                name: name,
                image: picture,
                refreshToken,
                refreshTokenExpiresAt,
            },
        });
        const accessToken = (0, jwt_util_1.createAccessToken)({
            email: user.email,
            name: user.name,
            image: user.image,
        });
        return { accessToken, refreshToken, user };
    }
    static async refreshAccessToken(refreshToken) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { refreshToken },
        });
        if (!user || !user.refreshTokenExpiresAt || user.refreshTokenExpiresAt < new Date()) {
            return null;
        }
        const newAccessToken = (0, jwt_util_1.createAccessToken)({
            email: user.email,
            name: user.name,
            image: user.image,
        });
        return newAccessToken;
    }
    static async getUserInfo(email) {
        return prisma_1.prisma.user.findUnique({
            where: { email },
            include: {
                events: true,
                goals: true,
                notifications: true,
            },
        });
    }
}
exports.AuthService = AuthService;
