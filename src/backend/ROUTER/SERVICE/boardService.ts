// 게시판 서비스

import { prisma } from '../../UTILS/database';

export interface BoardCreateData {
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  authorId: string;
}

export interface BoardUpdateData {
  title?: string;
  content?: string;
  category?: string;
  imageUrl?: string | null;
}

export interface BoardQueryParams {
  page?: number;
  size?: number;
  category?: string;
}

export class BoardService {
  // 게시글 목록 조회
  static async getBoards(params: BoardQueryParams) {
    const page = params.page || 0;
    const size = params.size || 10;
    const where = params.category ? { category: params.category } : {};

    const boards = await prisma.board.findMany({
      where,
      skip: page * size,
      take: size,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { userId: true, name: true },
        },
      },
    });

    const totalElements = await prisma.board.count({ where });
    const totalPages = Math.ceil(totalElements / size);

    return {
      content: boards,
      pageable: { pageNumber: page, pageSize: size },
      totalPages,
      totalElements,
    };
  }

  // 게시글 상세 조회
  static async getBoardById(id: number) {
    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        author: {
          select: { userId: true, name: true },
        },
      },
    });

    if (!board) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    return board;
  }

  // 게시글 작성
  static async createBoard(data: BoardCreateData) {
    const newBoard = await prisma.board.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        imageUrl: data.imageUrl,
        authorId: data.authorId,
      },
    });

    return newBoard;
  }

  // 게시글 수정
  static async updateBoard(id: number, data: BoardUpdateData, userId: string) {
    const existingBoard = await prisma.board.findUnique({ where: { id } });

    if (!existingBoard) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    if (existingBoard.authorId !== userId) {
      throw new Error('게시글 수정 권한이 없습니다.');
    }

    const updatedBoard = await prisma.board.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        imageUrl: data.imageUrl,
      },
    });

    return updatedBoard;
  }

  // 게시글 삭제
  static async deleteBoard(id: number, userId: string) {
    const existingBoard = await prisma.board.findUnique({ where: { id } });

    if (!existingBoard) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    if (existingBoard.authorId !== userId) {
      throw new Error('게시글 삭제 권한이 없습니다.');
    }

    await prisma.board.delete({ where: { id } });
  }
}
