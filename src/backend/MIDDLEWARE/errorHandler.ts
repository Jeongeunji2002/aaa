// 에러 처리 미들웨어

import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // 로그 출력
  console.error('❌ 에러 발생:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Prisma 에러 처리
  if (err.name === 'PrismaClientKnownRequestError') {
    const message = '데이터베이스 오류가 발생했습니다.';
    error = { message, statusCode: 400 } as AppError;
  }

  // Prisma 유효성 검사 에러
  if (err.name === 'PrismaClientValidationError') {
    const message = '입력 데이터가 유효하지 않습니다.';
    error = { message, statusCode: 400 } as AppError;
  }

  // JWT 에러 처리
  if (err.name === 'JsonWebTokenError') {
    const message = '유효하지 않은 토큰입니다.';
    error = { message, statusCode: 401 } as AppError;
  }

  if (err.name === 'TokenExpiredError') {
    const message = '토큰이 만료되었습니다.';
    error = { message, statusCode: 401 } as AppError;
  }

  // 중복 키 에러
  if (err.message.includes('Unique constraint')) {
    const message = '이미 존재하는 데이터입니다.';
    error = { message, statusCode: 409 } as AppError;
  }

  // 파일 업로드 에러
  if (err.message.includes('File too large')) {
    const message = '파일 크기가 너무 큽니다.';
    error = { message, statusCode: 413 } as AppError;
  }

  // 기본 에러 응답
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || '서버 내부 오류가 발생했습니다.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
