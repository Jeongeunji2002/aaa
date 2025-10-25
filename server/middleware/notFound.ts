// 404 처리 미들웨어

import { Request, Response } from 'express';

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `요청한 리소스를 찾을 수 없습니다: ${req.originalUrl}`,
  });
};
