// Express.js 백엔드 서버 메인 애플리케이션

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// 라우터 import
import authRoutes from './routes/auth';
import boardRoutes from './routes/boards';
import socialRoutes from './routes/social';

// 미들웨어 import
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 보안 미들웨어
app.use(helmet({
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

// CORS 설정
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

// 서버에서 user_info 쿠키를 더 이상 다루지 않습니다 (프론트 전용 ui_user 사용)

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100 요청
  message: {
    error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// 로그인 시도 제한
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5분
  max: 5, // 최대 5회
  message: {
    error: '너무 많은 로그인 시도입니다. 5분 후 다시 시도해주세요.',
  },
  skipSuccessfulRequests: true,
});

// 기본 미들웨어
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 정적 파일 서빙 (업로드된 이미지)
app.use('/uploads', express.static('uploads'));

// API 라우트
app.use('/api/auth', loginLimiter, authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/social', socialRoutes);

// 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 처리
app.use(notFound);

// 에러 처리
app.use(errorHandler);

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📱 프론트엔드: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
  console.log(`🔗 API 엔드포인트: http://localhost:${PORT}/api`);
});

export default app;
