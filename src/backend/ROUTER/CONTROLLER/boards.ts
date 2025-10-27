// 게시판 관련 라우터

import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { body, validationResult, query } from 'express-validator';
import { prisma } from '../../UTILS/database';
import { authenticateToken, optionalAuth, AuthRequest } from '../../MIDDLEWARE/auth';

const router = express.Router();

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  },
});

// 게시글 목록 조회
router.get('/', [
  query('page').optional().isInt({ min: 0 }).withMessage('페이지는 0 이상의 정수여야 합니다.'),
  query('size').optional().isInt({ min: 1, max: 50 }).withMessage('페이지 크기는 1-50 사이여야 합니다.'),
  query('category').optional().isIn(['NOTICE', 'FREE', 'QNA']).withMessage('유효하지 않은 카테고리입니다.'),
], optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 유효하지 않습니다.',
        errors: errors.array(),
      });
    }

    const page = parseInt(req.query.page as string) || 0;
    const size = parseInt(req.query.size as string) || 10;
    const category = req.query.category as string;

    // 필터 조건
    const where: any = {};
    if (category) {
      where.category = category;
    }

    // 게시글 조회
    const [boards, totalElements] = await Promise.all([
      prisma.board.findMany({
        where,
        skip: page * size,
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
      prisma.board.count({ where }),
    ]);

    const totalPages = Math.ceil(totalElements / size);

    res.json({
      success: true,
      data: {
        content: boards,
        pageable: {
          pageNumber: page,
          pageSize: size,
        },
        totalPages,
        totalElements,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 게시글 상세 조회
router.get('/:id', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 게시글 ID입니다.',
      });
    }

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
      return res.status(404).json({
        success: false,
        message: '게시글을 찾을 수 없습니다.',
      });
    }

    res.json({
      success: true,
      data: board,
    });
  } catch (error) {
    next(error);
  }
});

// 게시글 작성
router.post('/', authenticateToken, upload.single('image'), [
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('제목은 1-100자 사이여야 합니다.'),
  body('content')
    .isLength({ min: 1, max: 5000 })
    .withMessage('내용은 1-5000자 사이여야 합니다.'),
  body('category')
    .isIn(['NOTICE', 'FREE', 'QNA'])
    .withMessage('유효하지 않은 카테고리입니다.'),
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 유효하지 않습니다.',
        errors: errors.array(),
      });
    }

    const { title, content, category } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const board = await prisma.board.create({
      data: {
        title,
        content,
        category,
        imageUrl,
        authorId: req.user!.id,
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

    res.status(201).json({
      success: true,
      message: '게시글이 작성되었습니다.',
      data: board,
    });
  } catch (error) {
    next(error);
  }
});

// 게시글 수정
router.patch('/:id', authenticateToken, upload.single('image'), [
  body('title')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('제목은 1-100자 사이여야 합니다.'),
  body('content')
    .optional()
    .isLength({ min: 1, max: 5000 })
    .withMessage('내용은 1-5000자 사이여야 합니다.'),
  body('category')
    .optional()
    .isIn(['NOTICE', 'FREE', 'QNA'])
    .withMessage('유효하지 않은 카테고리입니다.'),
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 유효하지 않습니다.',
        errors: errors.array(),
      });
    }

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 게시글 ID입니다.',
      });
    }

    // 게시글 존재 및 권한 확인
    const existingBoard = await prisma.board.findUnique({
      where: { id },
    });

    if (!existingBoard) {
      return res.status(404).json({
        success: false,
        message: '게시글을 찾을 수 없습니다.',
      });
    }

    if (existingBoard.authorId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: '게시글을 수정할 권한이 없습니다.',
      });
    }

    const updateData: any = {};
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.content) updateData.content = req.body.content;
    if (req.body.category) updateData.category = req.body.category;
    if (req.file) updateData.imageUrl = `/uploads/${req.file.filename}`;

    const board = await prisma.board.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            userId: true,
            name: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: '게시글이 수정되었습니다.',
      data: board,
    });
  } catch (error) {
    next(error);
  }
});

// 게시글 삭제
router.delete('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 게시글 ID입니다.',
      });
    }

    // 게시글 존재 및 권한 확인
    const existingBoard = await prisma.board.findUnique({
      where: { id },
    });

    if (!existingBoard) {
      return res.status(404).json({
        success: false,
        message: '게시글을 찾을 수 없습니다.',
      });
    }

    if (existingBoard.authorId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: '게시글을 삭제할 권한이 없습니다.',
      });
    }

    await prisma.board.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: '게시글이 삭제되었습니다.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
