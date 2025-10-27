// 소셜 로그인 관련 라우터

import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { getSocialUserData, getSocialLoginUrl } from '../utils/socialAuth';

const router = express.Router();

// OAuth URL 생성 엔드포인트
router.get('/auth/:provider', (req: Request, res: Response) => {
  const { provider } = req.params;
  const state = req.query.state as string;
  
  try {
    const authUrl = getSocialLoginUrl(provider, state);
    res.json({ authUrl });
  } catch (error: any) {
    res.status(400).json({ 
      success: false,
      message: 'Invalid provider',
      error: error.message 
    });
  }
});

// 소셜 로그인 처리
router.post('/login', [
  body('provider').isIn(['naver', 'google', 'kakao', 'discord', 'twitter']).withMessage('유효하지 않은 소셜 제공자입니다.'),
  body('code').notEmpty().withMessage('인증 코드가 필요합니다.'),
  body('state').optional(),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 유효하지 않습니다.',
        errors: errors.array(),
      });
    }

    const { provider, code, state } = req.body;

    // 실제 OAuth 제공자와 연동하여 사용자 정보 가져오기
    const socialUserData = await getSocialUserData(provider, code);

    if (!socialUserData) {
      return res.status(401).json({
        success: false,
        message: '소셜 로그인에 실패했습니다.',
      });
    }

    // 기존 사용자 확인 또는 새 사용자 생성
    let user = await prisma.user.findFirst({
      where: {
        provider,
        providerId: socialUserData.id,
      },
    });

    if (!user) {
      // 새 사용자 생성
      user = await prisma.user.create({
        data: {
          userId: `${provider}_${socialUserData.id}`,
          name: socialUserData.name,
          email: socialUserData.email,
          provider,
          providerId: socialUserData.id,
        },
      });
    }

    // JWT 토큰 생성
    const accessToken = jwt.sign(
      { userId: user.id, userLoginId: user.userId },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Refresh Token 생성
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    // Refresh Token DB 저장
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일
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
  } catch (error) {
    next(error);
  }
});

export default router;
