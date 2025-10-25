// 소셜 로그인 관련 라우터

import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/database';

const router = express.Router();

// 소셜 로그인 처리
router.post('/login', [
  body('provider').isIn(['naver', 'google', 'kakao', 'discord', 'twitter']).withMessage('유효하지 않은 소셜 제공자입니다.'),
  body('code').notEmpty().withMessage('인증 코드가 필요합니다.'),
  body('state').optional().withMessage('CSRF 방지 state가 필요합니다.'),
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

    // TODO: 실제 OAuth 제공자와 연동하여 사용자 정보 가져오기
    // 현재는 모의 데이터로 처리
    const mockUserData = await getSocialUserData(provider, code);

    if (!mockUserData) {
      return res.status(401).json({
        success: false,
        message: '소셜 로그인에 실패했습니다.',
      });
    }

    // 기존 사용자 확인 또는 새 사용자 생성
    let user = await prisma.user.findFirst({
      where: {
        provider,
        providerId: mockUserData.id,
      },
    });

    if (!user) {
      // 새 사용자 생성
      user = await prisma.user.create({
        data: {
          userId: `${provider}_${mockUserData.id}`,
          name: mockUserData.name,
          email: mockUserData.email,
          provider,
          providerId: mockUserData.id,
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

// 소셜 제공자별 사용자 정보 가져오기 (모의 구현)
async function getSocialUserData(provider: string, code: string) {
  // 실제 구현에서는 각 제공자의 API를 호출하여 사용자 정보를 가져와야 합니다.
  // 현재는 모의 데이터를 반환합니다.

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

  // 실제로는 code를 사용하여 각 제공자의 API를 호출
  // 예: Google의 경우
  // const response = await fetch('https://oauth2.googleapis.com/token', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //   body: new URLSearchParams({
  //     client_id: process.env.GOOGLE_CLIENT_ID!,
  //     client_secret: process.env.GOOGLE_CLIENT_SECRET!,
  //     code,
  //     grant_type: 'authorization_code',
  //     redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
  //   }),
  // });

  return mockData[provider as keyof typeof mockData] || null;
}

export default router;
