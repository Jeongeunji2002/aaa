# 백엔드 서버 Dockerfile

FROM node:20-alpine

# OpenSSL 설치 (Prisma용)
RUN apk add --no-cache openssl

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY server/package*.json ./

# 의존성 설치 (개발 의존성 포함)
RUN npm ci

# 소스 코드 복사
COPY server/ .

# Prisma 스키마 복사
COPY prisma/ ./prisma/

# TypeScript 빌드
RUN npm run build

# Prisma 클라이언트 생성
RUN npx prisma generate --schema=./prisma/schema.prisma

# 프로덕션 의존성만 재설치
RUN npm ci --only=production && npm cache clean --force

# 업로드 디렉토리 생성
RUN mkdir -p uploads

# 포트 노출
EXPOSE 3001

# 헬스 체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# 애플리케이션 실행
CMD ["npm", "run", "start"]
