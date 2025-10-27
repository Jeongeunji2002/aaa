"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/signup', [
    (0, express_validator_1.body)('userId')
        .isLength({ min: 3, max: 20 })
        .withMessage('아이디는 3-20자 사이여야 합니다.')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('아이디는 영문, 숫자, 언더스코어만 사용 가능합니다.'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('비밀번호는 최소 6자 이상이어야 합니다.'),
    (0, express_validator_1.body)('name')
        .isLength({ min: 2, max: 20 })
        .withMessage('이름은 2-20자 사이여야 합니다.'),
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail()
        .withMessage('올바른 이메일 형식이 아닙니다.'),
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: '입력 데이터가 유효하지 않습니다.',
                errors: errors.array(),
            });
            return;
        }
        const { userId, password, name, email } = req.body;
        const existingUser = await database_1.prisma.user.findFirst({
            where: {
                OR: [
                    { userId },
                    ...(email ? [{ email }] : []),
                ],
            },
        });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: existingUser.userId === userId
                    ? '이미 사용 중인 아이디입니다.'
                    : '이미 사용 중인 이메일입니다.',
            });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await database_1.prisma.user.create({
            data: {
                userId,
                password: hashedPassword,
                name,
                email,
            },
            select: {
                id: true,
                userId: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });
        res.status(201).json({
            success: true,
            message: '회원가입이 완료되었습니다.',
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/login', [
    (0, express_validator_1.body)('userId').notEmpty().withMessage('아이디를 입력해주세요.'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('비밀번호를 입력해주세요.'),
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: '입력 데이터가 유효하지 않습니다.',
                errors: errors.array(),
            });
            return;
        }
        const { userId, password } = req.body;
        const user = await database_1.prisma.user.findUnique({
            where: { userId },
        });
        if (!user || !user.password) {
            res.status(401).json({
                success: false,
                message: '아이디 또는 비밀번호가 올바르지 않습니다.',
            });
            return;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: '아이디 또는 비밀번호가 올바르지 않습니다.',
            });
            return;
        }
        const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, userLoginId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        await database_1.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        res.json({
            success: true,
            message: '로그인 성공',
            data: {
                accessToken,
                refreshToken,
                user: {
                    userId: user.userId,
                    name: user.name,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/refresh', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(401).json({
                success: false,
                message: 'Refresh token이 필요합니다.',
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const storedToken = await database_1.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (!storedToken || storedToken.expiresAt < new Date()) {
            res.status(401).json({
                success: false,
                message: '유효하지 않은 refresh token입니다.',
            });
            return;
        }
        const newAccessToken = jsonwebtoken_1.default.sign({ userId: storedToken.user.id, userLoginId: storedToken.user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({
            success: true,
            data: {
                accessToken: newAccessToken,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/logout', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await database_1.prisma.refreshToken.deleteMany({
                where: { token: refreshToken },
            });
        }
        res.json({
            success: true,
            message: '로그아웃되었습니다.',
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/me', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const user = await database_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                userId: true,
                name: true,
                email: true,
                provider: true,
                createdAt: true,
            },
        });
        res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map