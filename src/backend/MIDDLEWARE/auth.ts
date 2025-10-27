// 인증 미들웨어

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../UTILS/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    userId: string;
    name: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다.',
      });
    }

    // JWT 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
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
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다.',
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
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

// 선택적 인증 (토큰이 있으면 검증, 없어도 통과)
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // 토큰이 없으면 그냥 통과
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
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
  } catch (error) {
    // 토큰 검증 실패해도 그냥 통과 (선택적 인증)
    next();
  }
};
