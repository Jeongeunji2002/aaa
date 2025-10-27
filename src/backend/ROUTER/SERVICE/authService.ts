// 인증 서비스

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../UTILS/database';

export interface SignupData {
  userId: string;
  password: string;
  name: string;
  email?: string;
}

export interface LoginData {
  userId: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    userId: string;
    name: string;
  };
}

export class AuthService {
  // 회원가입
  static async signup(data: SignupData) {
    const { userId, password, name, email } = data;

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
      throw new Error(
        existingUser.userId === userId
          ? '이미 사용 중인 아이디입니다.'
          : '이미 사용 중인 이메일입니다.'
      );
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

    return user;
  }

  // 로그인
  static async login(data: LoginData): Promise<AuthResponse> {
    const { userId, password } = data;

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user || !user.password) {
      throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
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

    return {
      accessToken,
      refreshToken,
      user: {
        userId: user.userId,
        name: user.name,
      },
    };
  }

  // 토큰 갱신
  static async refreshToken(refreshToken: string) {
    // Refresh Token 검증
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;

    // DB에서 Refresh Token 확인
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new Error('유효하지 않은 refresh token입니다.');
    }

    // 새로운 Access Token 생성
    const newAccessToken = jwt.sign(
      { userId: storedToken.user.id, userLoginId: storedToken.user.userId },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    return {
      accessToken: newAccessToken,
    };
  }

  // 로그아웃
  static async logout(refreshToken: string) {
    if (refreshToken) {
      // Refresh Token 삭제
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }
  }

  // 내 정보 조회
  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        provider: true,
        createdAt: true,
      },
    });

    return user;
  }
}
