# 📁 정은지 프로젝트 - 완전한 파일 구조 문서

## 🎯 프로젝트 개요
- **프로젝트명**: 정은지 (JeongEunJi)
- **타입**: JWT 인증 기반 반응형 게시판 CRUD 애플리케이션
- **기술 스택**: Next.js 16, React 19, TypeScript, Zustand, TailwindCSS, Express.js, PostgreSQL, Prisma
- **특징**: 소셜 로그인 지원 (네이버, 구글, 카카오, 디스코드, 트위터)

---

## 📂 루트 디렉토리 파일들

### 🔧 설정 파일들
```
├── package.json                    # 프론트엔드 의존성 및 스크립트
├── package-lock.json              # 프론트엔드 의존성 잠금 파일
├── tsconfig.json                  # TypeScript 설정
├── next.config.ts                # Next.js 설정
├── next-env.d.ts                  # Next.js 타입 정의
├── eslint.config.mjs              # ESLint 설정
├── postcss.config.mjs            # PostCSS 설정
├── prisma.config.ts              # Prisma 설정
├── middleware.ts                 # Next.js 미들웨어 (보안 헤더)
├── mock-server.js                # 테스트용 Mock API 서버
├── docker-compose.yml            # Docker Compose 설정
├── Dockerfile.frontend           # 프론트엔드 Docker 설정
└── README.md                     # 프로젝트 메인 문서
```

### 📋 문서 파일들
```
├── API_INTEGRATION_FIX.md        # API 통합 수정 가이드
├── DEBUGGING_GUIDE.md            # 디버깅 가이드
├── DOCKER_ORACLE_SETUP_COMPLETE.md # Oracle DB Docker 설정 완료
├── DOCKER_SUCCESS_REPORT.md      # Docker 성공 보고서
├── FINAL_SOLUTION_REPORT.md      # 최종 솔루션 보고서
├── FINAL_TEST_RESULTS.md         # 최종 테스트 결과
├── JWT_TOKEN_FIX_REPORT.md       # JWT 토큰 수정 보고서
├── ORACLE_DB_SETUP.md            # Oracle DB 설정 가이드
├── SOCIAL_LOGIN_API_GUIDE.md     # 소셜 로그인 API 가이드
└── TESTING_RESULTS.md            # 테스트 결과
```

---

## 🎨 프론트엔드 구조

### 📱 App Router 구조
```
app/
├── favicon.ico                   # 파비콘
├── globals.css                   # 전역 CSS 스타일
├── layout.tsx                    # 루트 레이아웃
├── page.tsx                      # 홈페이지
│
├── (auth)/                       # 인증 관련 페이지 그룹
│   ├── login/
│   │   └── page.tsx             # 로그인 페이지
│   └── signup/
│       └── page.tsx             # 회원가입 페이지
│
├── auth/                         # 소셜 로그인 콜백
│   └── callback/
│       ├── [provider]/
│       │   └── page.tsx        # 동적 소셜 로그인 콜백
│       ├── discord/             # 디스코드 콜백 (미사용)
│       ├── google/              # 구글 콜백 (미사용)
│       ├── kakao/               # 카카오 콜백 (미사용)
│       ├── naver/               # 네이버 콜백 (미사용)
│       └── twitter/             # 트위터 콜백 (미사용)
│
└── boards/                       # 게시판 관련 페이지
    ├── layout.tsx               # 게시판 레이아웃
    ├── page.tsx                 # 게시판 목록
    ├── new/
    │   └── page.tsx             # 새 게시글 작성
    └── [id]/                    # 동적 게시글 라우트
        ├── page.tsx             # 게시글 상세보기
        └── edit/
            └── page.tsx         # 게시글 수정
```

### 🧩 컴포넌트 구조
```
components/
├── auth/                         # 인증 관련 컴포넌트
│   ├── LoginForm.tsx            # 로그인 폼
│   ├── SignupForm.tsx           # 회원가입 폼
│   └── SocialLoginButtons.tsx   # 소셜 로그인 버튼들
│
├── boards/                       # 게시판 관련 컴포넌트
│   ├── BoardCard.tsx            # 게시글 카드
│   ├── BoardForm.tsx            # 게시글 작성/수정 폼
│   └── Pagination.tsx           # 페이지네이션
│
├── common/                       # 공통 컴포넌트
│   ├── EmptyState.tsx           # 빈 상태 표시
│   └── LoadingSpinner.tsx       # 로딩 스피너
│
└── layout/                       # 레이아웃 컴포넌트
    └── Header.tsx               # 헤더 컴포넌트
```

### 🔧 라이브러리 및 유틸리티
```
lib/
├── api/                          # API 관련 함수들
│   ├── auth.api.ts              # 인증 API
│   ├── axios.ts                 # Axios 설정 및 인터셉터
│   ├── board.api.ts             # 게시판 API
│   ├── database.api.ts          # 데이터베이스 API (미사용)
│   ├── index.ts                 # API 함수들 통합 export
│   └── social.api.ts            # 소셜 로그인 API
│
├── db/                           # 데이터베이스 관련
│   ├── index.ts                 # DB 유틸리티 함수들
│   └── prisma.ts                # Prisma 클라이언트
│
├── hooks/                        # 커스텀 훅
│   └── useAuth.ts               # 인증 관련 훅
│
└── utils/                        # 유틸리티 함수들
    ├── categoryLabels.ts        # 카테고리 라벨
    ├── cookie.ts                # 쿠키 관리
    ├── csrf.ts                  # CSRF 토큰 관리
    ├── dateFormat.ts            # 날짜 포맷팅
    ├── fileValidation.ts        # 파일 검증 (Magic Number)
    ├── index.ts                 # 유틸리티 통합 export
    ├── socialConfig.ts          # 소셜 로그인 설정
    └── tokenRefresh.ts          # 토큰 갱신 로직
```

### 🏪 상태 관리
```
store/
└── authStore.ts                 # Zustand 인증 스토어
```

### 📝 타입 정의
```
types/
├── auth.types.ts                # 인증 관련 타입
├── board.types.ts               # 게시판 관련 타입
├── index.ts                     # 타입 통합 export
└── social.types.ts              # 소셜 로그인 관련 타입
```

### 🎨 정적 파일
```
public/
├── file.svg                     # 파일 아이콘
├── globe.svg                    # 지구본 아이콘
├── next.svg                     # Next.js 로고
├── vercel.svg                   # Vercel 로고
└── window.svg                   # 윈도우 아이콘
```

---

## 🖥️ 백엔드 구조

### 🚀 서버 메인 파일
```
server/
├── app.ts                       # Express 애플리케이션 메인
├── package.json                 # 백엔드 의존성
├── package-lock.json            # 백엔드 의존성 잠금 파일
├── tsconfig.json                # 백엔드 TypeScript 설정
├── Dockerfile                   # 백엔드 Docker 설정
└── uploads/                     # 업로드된 파일 저장소
```

### 🛠️ 서버 설정
```
server/config/
└── database.ts                  # Prisma 클라이언트 설정
```

### 🛡️ 미들웨어
```
server/middleware/
├── auth.ts                      # JWT 인증 미들웨어
├── errorHandler.ts              # 전역 에러 핸들러
└── notFound.ts                  # 404 핸들러
```

### 🛣️ 라우터
```
server/routes/
├── auth.ts                      # 인증 관련 라우터
├── boards.ts                    # 게시판 관련 라우터
└── social.ts                    # 소셜 로그인 라우터
```

### 🔧 유틸리티
```
server/utils/
└── socialAuth.ts                # 소셜 로그인 OAuth 처리
```

### 📦 빌드 결과물
```
server/dist/                     # TypeScript 컴파일 결과
├── app.js                       # 컴파일된 메인 앱
├── app.d.ts                     # 타입 정의
├── config/
├── middleware/
├── routes/
└── src/
```

### 📁 중복 구조 (정리 필요)
```
server/src/                      # 중복된 소스 구조 (미사용)
├── app.ts
├── config/
├── middleware/
└── routes/
```

---

## 🗄️ 데이터베이스

### 📋 Prisma 스키마
```
prisma/
└── schema.prisma                # 데이터베이스 스키마 정의
```

---

## 📚 문서화

### 📖 프로젝트 문서
```
document/
├── BACKEND_SETUP.md             # 백엔드 설정 가이드
├── DATABASE_SETUP.md            # 데이터베이스 설정 가이드
├── FULLSTACK_SETUP_COMPLETE.md  # 풀스택 설정 완료
├── PROJECT_RESTRUCTURE_PLAN.md  # 프로젝트 재구조화 계획
├── PROJECT_SUMMARY.md           # 프로젝트 요약
├── SECURITY_CHECKLIST.md        # 보안 체크리스트
├── SECURITY_IMPROVEMENTS.md     # 보안 개선사항
├── SOCIAL_LOGIN_GUIDE.md        # 소셜 로그인 가이드
└── SOCIAL_LOGIN_README.md       # 소셜 로그인 README
```

---

## 🗂️ 레거시 구조 (정리 필요)

### 📁 미사용 디렉토리들
```
src/
├── backend/                      # 미사용 백엔드 구조
│   ├── dist/
│   └── routers/
├── document/                     # 미사용 문서
└── frontend/                     # 미사용 프론트엔드 구조
    ├── footer/
    ├── header/
    ├── section/
    └── sidebar/

BigsReportProject/                # 미사용 프로젝트 폴더
```

---

## 🔧 환경 설정

### 🔐 환경 변수
```
server/.env                      # 백엔드 환경 변수 (OAuth 키 포함)
```

### 📦 의존성 관리
```
node_modules/                    # 프론트엔드 의존성
server/node_modules/             # 백엔드 의존성
```

---

## 🐳 Docker 설정

### 🐳 컨테이너 구성
- **postgres-db**: PostgreSQL 데이터베이스 (포트 5434)
- **backend**: Express.js 백엔드 서버 (포트 3001)
- **frontend**: Next.js 프론트엔드 (포트 8080)

### 🌐 네트워크
- **jeongeunji-network**: 컨테이너 간 통신용 브리지 네트워크

### 💾 볼륨
- **postgres-data**: PostgreSQL 데이터 영구 저장

---

## 📊 프로젝트 통계

### 📁 총 파일 수
- **프론트엔드**: 약 50개 파일
- **백엔드**: 약 30개 파일
- **설정 파일**: 약 15개 파일
- **문서**: 약 20개 파일
- **총계**: 약 115개 파일

### 🎯 주요 기능
1. **JWT 인증 시스템**
2. **소셜 로그인** (5개 제공자)
3. **게시판 CRUD**
4. **파일 업로드**
5. **반응형 디자인**
6. **보안 헤더**
7. **토큰 갱신**
8. **CSRF 보호**

---

## 🚀 실행 방법

### 🐳 Docker로 실행
```bash
docker-compose up -d
```

### 🔧 로컬 개발
```bash
# 프론트엔드
npm run dev

# 백엔드
cd server
npm run dev
```

### 🌐 접속 URL
- **프론트엔드**: http://localhost:8080
- **백엔드 API**: http://localhost:3001/api
- **데이터베이스**: localhost:5434

---

## 📝 정리 권장사항

1. **미사용 디렉토리 정리**: `src/`, `BigsReportProject/` 삭제
2. **중복 파일 정리**: `server/src/` 삭제
3. **문서 통합**: `document/` 폴더의 문서들을 루트로 이동
4. **환경 변수 보안**: `.env` 파일 보안 강화

---

*이 문서는 프로젝트의 모든 파일과 구조를 완전히 정리한 것입니다. 누락된 파일이 있다면 즉시 알려주세요.*
