// 데이터베이스 관련 유틸리티

import { prisma } from './prisma';

export { prisma };

// 데이터베이스 연결 테스트
export async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ 데이터베이스 연결 성공');
    return true;
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error);
    return false;
  }
}

// 데이터베이스 연결 종료
export async function disconnectDatabase() {
  await prisma.$disconnect();
}
