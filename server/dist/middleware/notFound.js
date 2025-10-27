"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: `요청한 리소스를 찾을 수 없습니다: ${req.originalUrl}`,
    });
};
exports.notFound = notFound;
//# sourceMappingURL=notFound.js.map