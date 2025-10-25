// 인증 관련 라우터

import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// 회원가입
router.post('/signup', [
  body('userId')
    .isLength({ min: 3, max: 20 })
    .withMessage('아이디는 3-20자 사이여야 합니다.')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('아이디는 영문, 숫자, 언더스코어만 사용 가능합니다.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('비밀번호는 최소 6자 이상이어야 합니다.'),
  body('name')
    .isLength({ min: 2, max: 20 })
    .withMessage('이름은 2-20자 사이여야 합니다.'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('올바른 이메일 형식이 아닙니다.'),
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 유효성 검사
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: '입력 데이터가 유효하지 않습니다.',
        errors: errors.array(),
      });
      return;
    }

    const { userId, password, name, email } = req.body;

    // 중복 사용자 확인
    const existingUser = await prisma.user.findFirst({
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

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12);

    // 사용자 생성
    const user = await prisma.user.create({
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
  } catch (error) {
    next(error);
  }
});

// 로그인
router.post('/login', [
  body('userId').notEmpty().withMessage('아이디를 입력해주세요.'),
  body('password').notEmpty().withMessage('비밀번호를 입력해주세요.'),
], async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 유효성 검사
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: '입력 데이터가 유효하지 않습니다.',
        errors: errors.array(),
      });
      return;
    }

    const { userId, password } = req.body;

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user || !user.password) {
      res.status(401).json({
        success: false,
        message: '아이디 또는 비밀번호가 올바르지 않습니다.',
      });
      return;
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: '아이디 또는 비밀번호가 올바르지 않습니다.',
      });
      return;
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
  } catch (error) {
    next(error);
  }
});

// 토큰 갱신
router.post('/refresh', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token이 필요합니다.',
      });
      return;
    }

    // Refresh Token 검증
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
    
    // DB에서 Refresh Token 확인
    const storedToken = await prisma.refreshToken.findUnique({
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

    // 새로운 Access Token 생성
    const newAccessToken = jwt.sign(
      { userId: storedToken.user.id, userLoginId: storedToken.user.userId },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 로그아웃
router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Refresh Token 삭제
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    res.json({
      success: true,
      message: '로그아웃되었습니다.',
    });
  } catch (error) {
    next(error);
  }
});

// 내 정보 조회
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
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
  } catch (error) {
    next(error);
  }
});

export default router;
