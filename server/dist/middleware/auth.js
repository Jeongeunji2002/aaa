"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: '인증 토큰이 필요합니다.',
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await database_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                userId: true,
                name: true,
            },
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: '유효하지 않은 사용자입니다.',
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: '유효하지 않은 토큰입니다.',
            });
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: '토큰이 만료되었습니다.',
            });
        }
        return res.status(500).json({
            success: false,
            message: '인증 처리 중 오류가 발생했습니다.',
        });
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return next();
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await database_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                userId: true,
                name: true,
            },
        });
        if (user) {
            req.user = user;
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map