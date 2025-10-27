"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const express_validator_1 = require("express-validator");
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('이미지 파일만 업로드 가능합니다.'));
        }
    },
});
router.get('/', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 0 }).withMessage('페이지는 0 이상의 정수여야 합니다.'),
    (0, express_validator_1.query)('size').optional().isInt({ min: 1, max: 50 }).withMessage('페이지 크기는 1-50 사이여야 합니다.'),
    (0, express_validator_1.query)('category').optional().isIn(['NOTICE', 'FREE', 'QNA']).withMessage('유효하지 않은 카테고리입니다.'),
], auth_1.optionalAuth, async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '입력 데이터가 유효하지 않습니다.',
                errors: errors.array(),
            });
        }
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const category = req.query.category;
        const where = {};
        if (category) {
            where.category = category;
        }
        const [boards, totalElements] = await Promise.all([
            database_1.prisma.board.findMany({
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
            database_1.prisma.board.count({ where }),
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
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', auth_1.optionalAuth, async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 게시글 ID입니다.',
            });
        }
        const board = await database_1.prisma.board.findUnique({
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
    }
    catch (error) {
        next(error);
    }
});
router.post('/', auth_1.authenticateToken, upload.single('image'), [
    (0, express_validator_1.body)('title')
        .isLength({ min: 1, max: 100 })
        .withMessage('제목은 1-100자 사이여야 합니다.'),
    (0, express_validator_1.body)('content')
        .isLength({ min: 1, max: 5000 })
        .withMessage('내용은 1-5000자 사이여야 합니다.'),
    (0, express_validator_1.body)('category')
        .isIn(['NOTICE', 'FREE', 'QNA'])
        .withMessage('유효하지 않은 카테고리입니다.'),
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '입력 데이터가 유효하지 않습니다.',
                errors: errors.array(),
            });
        }
        const { title, content, category } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        const board = await database_1.prisma.board.create({
            data: {
                title,
                content,
                category,
                imageUrl,
                authorId: req.user.id,
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
    }
    catch (error) {
        next(error);
    }
});
router.patch('/:id', auth_1.authenticateToken, upload.single('image'), [
    (0, express_validator_1.body)('title')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('제목은 1-100자 사이여야 합니다.'),
    (0, express_validator_1.body)('content')
        .optional()
        .isLength({ min: 1, max: 5000 })
        .withMessage('내용은 1-5000자 사이여야 합니다.'),
    (0, express_validator_1.body)('category')
        .optional()
        .isIn(['NOTICE', 'FREE', 'QNA'])
        .withMessage('유효하지 않은 카테고리입니다.'),
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
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
        const existingBoard = await database_1.prisma.board.findUnique({
            where: { id },
        });
        if (!existingBoard) {
            return res.status(404).json({
                success: false,
                message: '게시글을 찾을 수 없습니다.',
            });
        }
        if (existingBoard.authorId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: '게시글을 수정할 권한이 없습니다.',
            });
        }
        const updateData = {};
        if (req.body.title)
            updateData.title = req.body.title;
        if (req.body.content)
            updateData.content = req.body.content;
        if (req.body.category)
            updateData.category = req.body.category;
        if (req.file)
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        const board = await database_1.prisma.board.update({
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
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 게시글 ID입니다.',
            });
        }
        const existingBoard = await database_1.prisma.board.findUnique({
            where: { id },
        });
        if (!existingBoard) {
            return res.status(404).json({
                success: false,
                message: '게시글을 찾을 수 없습니다.',
            });
        }
        if (existingBoard.authorId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: '게시글을 삭제할 권한이 없습니다.',
            });
        }
        await database_1.prisma.board.delete({
            where: { id },
        });
        res.json({
            success: true,
            message: '게시글이 삭제되었습니다.',
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=boards.js.map