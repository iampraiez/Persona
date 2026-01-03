"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_utils_1 = require("../utils/logger.utils");
const error_util_1 = require("../utils/error.util");
const auth_service_1 = require("../services/auth.service");
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
const FRONTEND_URL = env_1.env.data?.CLIENT_URL || "http://localhost:5173";
router.get("/google", async (req, res) => {
    try {
        const authUrl = await auth_service_1.AuthService.getGoogleAuthUrl();
        res.json({ data: authUrl, error: null });
    }
    catch (error) {
        logger_utils_1.logger.error(`Google Auth Error: ${error}`);
        res.status(500).json({
            data: null,
            error: (0, error_util_1.errorWrapper)(error, "Failed to get auth url"),
        });
    }
});
router.get("/google/callback", async (req, res) => {
    const { code } = req.query;
    if (!code)
        return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
    try {
        const { accessToken, refreshToken } = await auth_service_1.AuthService.handleGoogleCallback(code);
        res.cookie("access_token", accessToken, auth_service_1.ACCESS_TOKEN_OPTIONS);
        res.cookie("refresh_token", refreshToken, auth_service_1.COOKIE_OPTIONS);
        return res.redirect(`${FRONTEND_URL}/login?success=true`);
    }
    catch (error) {
        logger_utils_1.logger.error(`Google Auth Error: ${error}`);
        return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
    }
});
router.get("/refresh", async (req, res) => {
    try {
        const refreshToken = req.cookies?.refresh_token;
        if (!refreshToken) {
            res.status(401).json({ data: null, error: "No refresh token" });
            return;
        }
        const newAccessToken = await auth_service_1.AuthService.refreshAccessToken(refreshToken);
        if (!newAccessToken) {
            res.status(401).json({ data: null, error: "Invalid or expired refresh token" });
            return;
        }
        res.cookie("access_token", newAccessToken, auth_service_1.ACCESS_TOKEN_OPTIONS);
        res.status(200).json({ data: true, error: null });
    }
    catch (error) {
        logger_utils_1.logger.error(`Refresh Error: ${error}`);
        res.status(500).json({ data: null, error: "Failed to refresh token" });
    }
});
router.get("/logout", async (req, res) => {
    try {
        res.clearCookie("access_token", auth_service_1.ACCESS_TOKEN_OPTIONS);
        res.clearCookie("refresh_token", auth_service_1.COOKIE_OPTIONS);
        res.status(200).json({ data: true, error: null });
    }
    catch (error) {
        logger_utils_1.logger.error(`Logout Error: ${error}`);
        res.status(500).json({
            data: null,
            error: (0, error_util_1.errorWrapper)(error, "Failed to logout"),
        });
    }
});
exports.default = router;
