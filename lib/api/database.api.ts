// 데이터베이스 직접 연동 API (백엔드 없이 사용)

import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { SignupData, LoginData, CreateBoardData, UpdateBoardData } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// 사용자 관련 API
export const dbAuthApi = {
  // 회원가입
  async signup(data: SignupData) {
    const { userId, password, name, email } = data;
    
    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        userId,
        password: hashedPassword,
        name,
        email,
      },
    });
    
    return user;
  },
  
  // 로그인
  async login(data: LoginData) {
    const { userId, password } = data;
    
    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { userId },
    });
    
    if (!user || !user.password) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }
    
    // 비밀번호 확인
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('비밀번호가 일치하지 않습니다.');
    }
    
    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user.userId, id: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return {
      accessToken: token,
      userId: user.userId,
      name: user.name,
    };
  },
  
  // 소셜 로그인
  async socialLogin(provider: string, providerId: string, name: string, email?: string) {
    // 기존 사용자 찾기
    let user = await prisma.user.findFirst({
      where: {
        provider,
        providerId,
      },
    });
    
    // 신규 사용자면 생성
    if (!user) {
      user = await prisma.user.create({
        data: {
          userId: `${provider}_${providerId}`,
          name,
          email,
          provider,
          providerId,
        },
      });
    }
    
    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user.userId, id: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return {
      accessToken: token,
      userId: user.userId,
      name: user.name,
      provider: user.provider,
    };
  },
  
  // 사용자 정보 조회
  async getUserByToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; id: string };
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          provider: true,
        },
      });
      
      return user;
    } catch (error) {
      throw new Error('유효하지 않은 토큰입니다.');
    }
  },
};

// 게시판 관련 API
export const dbBoardApi = {
  // 게시글 목록 조회
  async getBoardList(page: number = 0, size: number = 10) {
    const skip = page * size;
    
    const [boards, total] = await Promise.all([
      prisma.board.findMany({
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              userId: true,
              name: true,
            },
          },
        },
      }),
      prisma.board.count(),
    ]);
    
    return {
      content: boards,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size,
      number: page,
      first: page === 0,
      last: page >= Math.ceil(total / size) - 1,
    };
  },
  
  // 게시글 상세 조회
  async getBoardDetail(id: number) {
    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            userId: true,
            name: true,
          },
        },
      },
    });
    
    if (!board) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }
    
    return board;
  },
  
  // 게시글 작성
  async createBoard(data: CreateBoardData, authorId: string, imageUrl?: string) {
    const board = await prisma.board.create({
      data: {
        ...data,
        imageUrl,
        authorId,
      },
      include: {
        author: {
          select: {
            userId: true,
            name: true,
          },
        },
      },
    });
    
    return board;
  },
  
  // 게시글 수정
  async updateBoard(id: number, data: UpdateBoardData, authorId: string, imageUrl?: string) {
    // 작성자 확인
    const board = await prisma.board.findUnique({
      where: { id },
    });
    
    if (!board) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }
    
    if (board.authorId !== authorId) {
      throw new Error('수정 권한이 없습니다.');
    }
    
    const updatedBoard = await prisma.board.update({
      where: { id },
      data: {
        ...data,
        ...(imageUrl && { imageUrl }),
      },
      include: {
        author: {
          select: {
            userId: true,
            name: true,
          },
        },
      },
    });
    
    return updatedBoard;
  },
  
  // 게시글 삭제
  async deleteBoard(id: number, authorId: string) {
    // 작성자 확인
    const board = await prisma.board.findUnique({
      where: { id },
    });
    
    if (!board) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }
    
    if (board.authorId !== authorId) {
      throw new Error('삭제 권한이 없습니다.');
    }
    
    await prisma.board.delete({
      where: { id },
    });
  },
};
