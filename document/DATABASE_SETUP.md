# 🗄️ PostgreSQL 데이터베이스 설정 가이드

## 📋 설치 완료된 패키지

- ✅ **Prisma** - ORM 및 데이터베이스 마이그레이션
- ✅ **PostgreSQL Client** - pg, @types/pg
- ✅ **bcryptjs** - 비밀번호 해시화
- ✅ **jsonwebtoken** - JWT 토큰 생성
- ✅ **dotenv** - 환경변수 관리

---

## 🗃️ 데이터베이스 스키마

### User 모델
```sql
- id: String (Primary Key, CUID)
- userId: String (Unique) - 로그인용 아이디
- password: String? - 일반 로그인용 (소셜 로그인 시 null)
- name: String - 사용자 이름
- email: String? (Unique) - 이메일
- provider: String? - 소셜 로그인 제공자
- providerId: String? - 소셜 로그인 제공자의 사용자 ID
- createdAt: DateTime
- updatedAt: DateTime
```

### Board 모델
```sql
- id: Int (Primary Key, Auto Increment)
- title: String - 게시글 제목
- content: String - 게시글 내용
- category: String - NOTICE, FREE, QNA
- imageUrl: String? - 이미지 URL
- authorId: String (Foreign Key) - 작성자 ID
- createdAt: DateTime
- updatedAt: DateTime
```

---

## 🔧 설정 방법

### 1. PostgreSQL 설치 및 실행

#### Windows (PostgreSQL 설치)
```bash
# 1. PostgreSQL 다운로드 및 설치
# https://www.postgresql.org/download/windows/

# 2. 서비스 시작
net start postgresql-x64-14

# 3. psql 접속
psql -U postgres
```

#### Docker 사용 (권장)
```bash
# PostgreSQL 컨테이너 실행
docker run --name jeongeunji-postgres \
  -e POSTGRES_DB=jeongeunji_db \
  -e POSTGRES_USER=jeongeunji \
  -e POSTGRES_PASSWORD=password123 \
  -p 5432:5432 \
  -d postgres:15
```

### 2. 환경변수 설정

`.env.local` 파일 생성:
```env
DATABASE_URL="postgresql://jeongeunji:password123@localhost:5432/jeongeunji_db?schema=public"
JWT_SECRET="your_super_secret_jwt_key_here"
```

### 3. 데이터베이스 마이그레이션

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션 실행
npx prisma migrate dev --name init

# 데이터베이스 시각화 (선택사항)
npx prisma studio
```

---

## 🚀 사용 방법

### API 모드 선택

#### 1. 외부 API 사용 (기본)
```typescript
// lib/api/auth.api.ts 사용
import { login, signup } from '@/lib/api/auth.api';
```

#### 2. 데이터베이스 직접 사용
```typescript
// lib/api/database.api.ts 사용
import { dbAuthApi, dbBoardApi } from '@/lib/api/database.api';
```

### 데이터베이스 연결 테스트

```typescript
// lib/db/index.ts
import { testDatabaseConnection } from '@/lib/db';

// 연결 테스트
await testDatabaseConnection();
```

---

## 📁 생성된 파일 구조

```
lib/
├── db/
│   ├── prisma.ts      # Prisma 클라이언트 인스턴스
│   └── index.ts       # DB 유틸리티 함수
├── api/
│   └── database.api.ts # DB 직접 연동 API
prisma/
├── schema.prisma      # 데이터베이스 스키마
└── migrations/        # 마이그레이션 파일들
.env.local.example     # 환경변수 예시
```

---

## 🔄 마이그레이션 명령어

```bash
# 개발용 마이그레이션
npx prisma migrate dev

# 프로덕션용 마이그레이션
npx prisma migrate deploy

# 스키마 리셋 (개발용)
npx prisma migrate reset

# Prisma Studio 실행
npx prisma studio
```

---

## 🎯 다음 단계

1. **PostgreSQL 설치/실행**
2. **환경변수 설정** (`.env.local`)
3. **마이그레이션 실행** (`npx prisma migrate dev`)
4. **API 모드 선택** (외부 API vs DB 직접)
5. **연결 테스트**

---

**작성일**: 2025년 10월 24일  
**프로젝트**: 정은지 게시판 플랫폼
