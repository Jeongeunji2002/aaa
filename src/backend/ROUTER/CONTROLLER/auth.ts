// 인증 관련 라우터

import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthRequest } from '../../MIDDLEWARE/auth';
import { AuthService } from '../SERVICE/authService';

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

    // 서비스를 통한 회원가입
    const user = await AuthService.signup({ userId, password, name, email });

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: user,
    });
  } catch (error: any) {
    if (error.message.includes('이미 사용 중인')) {
      res.status(409).json({
        success: false,
        message: error.message,
      });
      return;
    }
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

    // 서비스를 통한 로그인
    const result = await AuthService.login({ userId, password });

    res.json({
      success: true,
      message: '로그인 성공',
      data: result,
    });
  } catch (error: any) {
    if (error.message.includes('아이디 또는 비밀번호')) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
      return;
    }
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

    // 서비스를 통한 토큰 갱신
    const result = await AuthService.refreshToken(refreshToken);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message.includes('유효하지 않은')) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
      return;
    }
    next(error);
  }
});

// 로그아웃
router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    // 서비스를 통한 로그아웃
    await AuthService.logout(refreshToken);

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
    // 서비스를 통한 내 정보 조회
    const user = await AuthService.getMe(req.user!.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
