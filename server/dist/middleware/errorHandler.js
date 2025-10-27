"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    console.error('❌ 에러 발생:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
    });
    if (err.name === 'PrismaClientKnownRequestError') {
        const message = '데이터베이스 오류가 발생했습니다.';
        error = { message, statusCode: 400 };
    }
    if (err.name === 'PrismaClientValidationError') {
        const message = '입력 데이터가 유효하지 않습니다.';
        error = { message, statusCode: 400 };
    }
    if (err.name === 'JsonWebTokenError') {
        const message = '유효하지 않은 토큰입니다.';
        error = { message, statusCode: 401 };
    }
    if (err.name === 'TokenExpiredError') {
        const message = '토큰이 만료되었습니다.';
        error = { message, statusCode: 401 };
    }
    if (err.message.includes('Unique constraint')) {
        const message = '이미 존재하는 데이터입니다.';
        error = { message, statusCode: 409 };
    }
    if (err.message.includes('File too large')) {
        const message = '파일 크기가 너무 큽니다.';
        error = { message, statusCode: 413 };
    }
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || '서버 내부 오류가 발생했습니다.',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map