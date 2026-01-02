"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccessToken = createAccessToken;
exports.generateRandomToken = generateRandomToken;
exports.verifyAccessToken = verifyAccessToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const JWT_SECRET = env_1.env.data?.JWT_SECRET || "random-ass-secret";
const ACCESS_TOKEN_EXPIRY = "15m";
function createAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}
function generateRandomToken() {
    return crypto_1.default.randomBytes(40).toString("hex");
}
function verifyAccessToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch {
        return null;
    }
}
