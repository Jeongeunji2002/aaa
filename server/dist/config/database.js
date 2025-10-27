"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDatabaseConnection = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const prismaClientSingleton = () => {
    return new client_1.PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        datasources: {
            db: {
                url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test',
            },
        },
    });
};
const prisma = globalThis.prisma ?? prismaClientSingleton();
exports.prisma = prisma;
if (process.env.NODE_ENV !== 'production')
    globalThis.prisma = prisma;
const testDatabaseConnection = async () => {
    try {
        await prisma.$connect();
        console.log('✅ 데이터베이스 연결 성공');
        return true;
    }
    catch (error) {
        console.error('❌ 데이터베이스 연결 실패:', error);
        return false;
    }
};
exports.testDatabaseConnection = testDatabaseConnection;
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=database.js.map