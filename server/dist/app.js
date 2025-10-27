"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const boards_1 = __importDefault(require("./routes/boards"));
const social_1 = __importDefault(require("./routes/social"));
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, helmet_1.default)({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: {
        error: '너무 많은 로그인 시도입니다. 5분 후 다시 시도해주세요.',
    },
    skipSuccessfulRequests: true,
});
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express_1.default.static('uploads'));
app.use('/api/auth', loginLimiter, auth_1.default);
app.use('/api/boards', boards_1.default);
app.use('/api/social', social_1.default);
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`📱 프론트엔드: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
    console.log(`🔗 API 엔드포인트: http://localhost:${PORT}/api`);
});
exports.default = app;
//# sourceMappingURL=app.js.map