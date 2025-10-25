# 🚀 백엔드 서버 구축 완료!

## ✅ 구현된 백엔드 기능들

### 1. **Express.js 서버** ✅
- **포트**: 3001
- **보안**: Helmet, CORS, Rate Limiting
- **로깅**: Morgan
- **에러 처리**: 전역 에러 핸들러

### 2. **인증 시스템** ✅
- **회원가입**: `/api/auth/signup`
- **로그인**: `/api/auth/login`
- **토큰 갱신**: `/api/auth/refresh`
- **로그아웃**: `/api/auth/logout`
- **내 정보**: `/api/auth/me`

### 3. **게시판 CRUD** ✅
- **목록 조회**: `GET /api/boards`
- **상세 조회**: `GET /api/boards/:id`
- **게시글 작성**: `POST /api/boards`
- **게시글 수정**: `PATCH /api/boards/:id`
- **게시글 삭제**: `DELETE /api/boards/:id`

### 4. **소셜 로그인** ✅
- **소셜 로그인**: `POST /api/social/login`
- **지원 제공자**: 네이버, 구글, 카카오, 디스코드, 트위터

### 5. **파일 업로드** ✅
- **이미지 업로드**: 5MB 제한
- **파일 검증**: Magic Number 검증
- **정적 파일 서빙**: `/uploads` 경로

---

## 🗄️ 데이터베이스 설정

### 오라클 DB 연결
```bash
# .env 파일에 설정
DATABASE_URL="oracle://username:password@localhost:1521/XE"
```

### Prisma 스키마
```prisma
model User {
  id        String   @id @default(cuid())
  userId    String   @unique
  password  String?
  name      String
  email     String?  @unique
  provider  String?
  providerId String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  boards        Board[]
  refreshTokens RefreshToken[]
  
  @@map("USERS")
}

model Board {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  category  String
  imageUrl  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  
  @@map("BOARDS")
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("REFRESH_TOKENS")
}
```

---

## 🔧 서버 실행 방법

### 1. 환경 변수 설정
```bash
# server/.env 파일 생성
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
DATABASE_URL="oracle://username:password@localhost:1521/XE"
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
```

### 2. 패키지 설치
```bash
cd server
npm install
```

### 3. 데이터베이스 마이그레이션
```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 스키마 푸시
npx prisma db push
```

### 4. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm run build
npm start
```

---

## 🔗 API 엔드포인트

### 인증 API
```typescript
// 회원가입
POST /api/auth/signup
{
  "userId": "string",
  "password": "string",
  "name": "string",
  "email": "string?"
}

// 로그인
POST /api/auth/login
{
  "userId": "string",
  "password": "string"
}

// 토큰 갱신
POST /api/auth/refresh
{
  "refreshToken": "string"
}

// 로그아웃
POST /api/auth/logout
Authorization: Bearer <token>
{
  "refreshToken": "string"
}

// 내 정보
GET /api/auth/me
Authorization: Bearer <token>
```

### 게시판 API
```typescript
// 게시글 목록
GET /api/boards?page=0&size=10&category=FREE

// 게시글 상세
GET /api/boards/:id

// 게시글 작성
POST /api/boards
Authorization: Bearer <token>
Content-Type: multipart/form-data
{
  "title": "string",
  "content": "string",
  "category": "NOTICE|FREE|QNA",
  "image": File?
}

// 게시글 수정
PATCH /api/boards/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

// 게시글 삭제
DELETE /api/boards/:id
Authorization: Bearer <token>
```

### 소셜 로그인 API
```typescript
// 소셜 로그인
POST /api/social/login
{
  "provider": "naver|google|kakao|discord|twitter",
  "code": "string",
  "state": "string?"
}
```

---

## 🛡️ 보안 기능

### 1. **Rate Limiting**
- 일반 요청: 15분에 100회
- 로그인: 5분에 5회

### 2. **JWT 토큰**
- Access Token: 1시간
- Refresh Token: 7일
- 자동 갱신 지원

### 3. **파일 업로드 보안**
- 파일 크기 제한: 5MB
- 파일 타입 검증: 이미지만
- Magic Number 검증

### 4. **CORS 설정**
- 프론트엔드 도메인만 허용
- Credentials 지원

### 5. **보안 헤더**
- Helmet.js 적용
- XSS, CSRF 방지

---

## 📁 서버 구조

```
server/
├── src/
│   ├── app.ts              # 메인 애플리케이션
│   ├── config/
│   │   └── database.ts     # 데이터베이스 설정
│   ├── middleware/
│   │   ├── auth.ts         # 인증 미들웨어
│   │   ├── errorHandler.ts # 에러 처리
│   │   └── notFound.ts     # 404 처리
│   └── routes/
│       ├── auth.ts         # 인증 라우터
│       ├── boards.ts       # 게시판 라우터
│       └── social.ts       # 소셜 로그인 라우터
├── uploads/                # 업로드된 파일
├── package.json
├── tsconfig.json
└── .env                    # 환경 변수
```

---

## 🔄 프론트엔드 연동

### API URL 변경
```typescript
// lib/api/axios.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
```

### 환경 변수 설정
```bash
# .env.local 파일 생성
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 🧪 테스트 방법

### 1. 서버 상태 확인
```bash
curl http://localhost:3001/api/health
```

### 2. 회원가입 테스트
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "testuser",
    "password": "password123",
    "name": "테스트 사용자",
    "email": "test@example.com"
  }'
```

### 3. 로그인 테스트
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "testuser",
    "password": "password123"
  }'
```

### 4. 게시글 목록 조회
```bash
curl http://localhost:3001/api/boards
```

---

## 🚀 다음 단계

### 1. **오라클 DB 설정**
- 오라클 데이터베이스 설치
- 사용자 계정 생성
- DATABASE_URL 설정

### 2. **소셜 로그인 실제 연동**
- 각 제공자에서 클라이언트 ID/Secret 발급
- OAuth 콜백 URL 설정
- 실제 API 연동 구현

### 3. **프로덕션 배포**
- 환경 변수 보안 설정
- HTTPS 설정
- 로드 밸런싱
- 모니터링 설정

---

## 📊 현재 상태

### ✅ 완료된 기능
- [x] Express.js 서버 구축
- [x] 인증 시스템 (JWT)
- [x] 게시판 CRUD API
- [x] 소셜 로그인 API 구조
- [x] 파일 업로드
- [x] 보안 미들웨어
- [x] 프론트엔드 연동

### 🔄 진행 중
- [ ] 오라클 DB 연결
- [ ] 실제 소셜 로그인 연동
- [ ] 프로덕션 배포

---

**🎉 백엔드 서버 구축 완료!**

이제 오라클 DB만 연결하면 완전한 풀스택 애플리케이션이 됩니다! 🚀✨
