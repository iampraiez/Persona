"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt_util_1 = require("../utils/jwt.util");
const logger_utils_1 = require("../utils/logger.utils");
function authMiddleware(req, res, next) {
    try {
        const token = req.cookies?.access_token;
        console.log("Auth Middleware Invoked. Token:", token);
        if (!token) {
            res.status(401).json({ error: "Unauthorized", data: null });
            return;
        }
        const payload = (0, jwt_util_1.verifyAccessToken)(token);
        console.log("Token Payload:", payload);
        if (!payload) {
            res.status(401).json({ error: "Token expired or invalid", data: null });
            return;
        }
        req.user = payload.email;
        next();
    }
    catch (error) {
        logger_utils_1.logger.error(`Auth Error: ${error.message}`);
        res.status(401).json({ error: "Unauthorized", data: null });
    }
}
