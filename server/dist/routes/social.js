"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const database_1 = require("../config/database");
const router = express_1.default.Router();
router.post('/login', [
    (0, express_validator_1.body)('provider').isIn(['naver', 'google', 'kakao', 'discord', 'twitter']).withMessage('유효하지 않은 소셜 제공자입니다.'),
    (0, express_validator_1.body)('code').notEmpty().withMessage('인증 코드가 필요합니다.'),
    (0, express_validator_1.body)('state').optional().withMessage('CSRF 방지 state가 필요합니다.'),
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '입력 데이터가 유효하지 않습니다.',
                errors: errors.array(),
            });
        }
        const { provider, code, state } = req.body;
        const mockUserData = await getSocialUserData(provider, code);
        if (!mockUserData) {
            return res.status(401).json({
                success: false,
                message: '소셜 로그인에 실패했습니다.',
            });
        }
        let user = await database_1.prisma.user.findFirst({
            where: {
                provider,
                providerId: mockUserData.id,
            },
        });
        if (!user) {
            user = await database_1.prisma.user.create({
                data: {
                    userId: `${provider}_${mockUserData.id}`,
                    name: mockUserData.name,
                    email: mockUserData.email,
                    provider,
                    providerId: mockUserData.id,
                },
            });
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
            message: `${provider} 로그인 성공`,
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
async function getSocialUserData(provider, code) {
    const mockData = {
        naver: {
            id: 'naver_12345',
            name: '네이버 사용자',
            email: 'naver@example.com',
        },
        google: {
            id: 'google_67890',
            name: '구글 사용자',
            email: 'google@example.com',
        },
        kakao: {
            id: 'kakao_11111',
            name: '카카오 사용자',
            email: 'kakao@example.com',
        },
        discord: {
            id: 'discord_22222',
            name: '디스코드 사용자',
            email: 'discord@example.com',
        },
        twitter: {
            id: 'twitter_33333',
            name: '트위터 사용자',
            email: 'twitter@example.com',
        },
    };
    return mockData[provider] || null;
}
exports.default = router;
//# sourceMappingURL=social.js.map