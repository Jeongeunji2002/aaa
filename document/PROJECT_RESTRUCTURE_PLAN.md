# 📁 프로젝트 구조 재구성 계획서

## 📋 현재 상황 분석

### 현재 구조 (Next.js App Router)
```
aaa/
├── app/                    # Next.js App Router
├── components/             # React 컴포넌트
├── lib/                    # 유틸리티 및 API
├── store/                  # Zustand 스토어
├── types/                  # TypeScript 타입
├── prisma/                 # 데이터베이스 스키마
└── public/                 # 정적 파일
```

### 목표 구조 (제시된 규칙)
```
src/
├── document/               # 문서
├── backend/                # 백엔드
│   ├── routers/
│   │   ├── controller/
│   │   └── service/
│   └── dist/
│       ├── db_connection/
│       │   └── prisma/
│       ├── models/
│       ├── node_modules/
│       ├── utils/
│       ├── middleware/
│       └── type/
└── frontend/               # 프론트엔드
    ├── header/
    ├── section/
    │   └── body/
    │       └── [카테고리별 디렉터리]/
    ├── sidebar/
    └── footer/
```

---

## ⚠️ 고려사항 및 제약사항

### 1. Next.js App Router 제약
- **현재**: `app/` 디렉터리가 라우팅의 핵심
- **문제**: Next.js는 `app/` 디렉터리 구조를 강제함
- **해결방안**: 
  - Option A: Next.js 구조 유지 + 내부 재구성
  - Option B: 완전 재구성 (Next.js 라우팅 수동 구현)

### 2. 빌드 시스템 영향
- **현재**: Next.js 자동 빌드 시스템
- **문제**: 구조 변경 시 빌드 경로 수정 필요
- **해결방안**: `next.config.js`에서 경로 별칭 설정

### 3. TypeScript 경로 매핑
- **현재**: `@/*` 별칭 사용
- **문제**: 구조 변경 시 모든 import 경로 수정
- **해결방안**: `tsconfig.json` 경로 매핑 업데이트

---

## 🎯 재구성 옵션

### Option A: Next.js 호환 재구성 (권장)
```
src/
├── document/               # 문서
├── backend/                # 백엔드 로직
│   ├── routers/
│   │   ├── controller/
│   │   └── service/
│   └── dist/
│       ├── db_connection/
│       ├── models/
│       ├── utils/
│       ├── middleware/
│       └── type/
├── frontend/               # 프론트엔드 컴포넌트
│   ├── header/
│   ├── section/
│   │   └── body/
│   ├── sidebar/
│   └── footer/
└── app/                    # Next.js App Router (유지)
    ├── (auth)/
    ├── boards/
    └── layout.tsx
```

### Option B: 완전 재구성 (복잡함)
```
src/
├── document/
├── backend/
└── frontend/
    ├── pages/              # 수동 라우팅 구현
    ├── components/
    └── app.tsx             # 메인 앱 컴포넌트
```

---

## 📝 파일명 규칙 적용

### 현재 → 목표 변환 예시
```
components/auth/LoginForm.tsx → frontend/section/body/auth/loginForm.tsx
lib/api/auth.api.ts → backend/dist/utils/authApi.ts
store/authStore.ts → frontend/utils/authStore.ts
types/auth.types.ts → backend/dist/type/authTypes.ts
```

### 파일명 규칙
- ✅ `loginForm.tsx` (소문자 시작)
- ✅ `realtimeProtocolService.ts` (camelCase)
- ❌ `LoginForm.tsx` (대문자 시작 금지)
- ❌ `login_form.tsx` (언더스코어 금지)

---

## 🗂️ 디렉터리 규칙 적용

### 디렉터리명 규칙
- ✅ `AUTH_SECTION/` (대문자 + 언더스코어)
- ✅ `USER_MANAGEMENT/` (대문자 + 언더스코어)
- ❌ `auth-section/` (소문자 + 하이픈 금지)
- ❌ `userManagement/` (camelCase 금지)

### 허용된 구조
```
frontend/
├── header/                 # 2레벨 직접 허용
├── footer/                 # 2레벨 직접 허용
├── section/
│   └── body/
│       ├── AUTH_SECTION/   # 카테고리별 디렉터리
│       ├── BOARD_SECTION/
│       └── USER_SECTION/
└── sidebar/
    └── NAVIGATION_SECTION/ # sidebar 하위 허용
```

---

## 🔄 마이그레이션 계획

### Phase 1: 디렉터리 구조 생성
1. `src/` 디렉터리 생성
2. 2레벨 디렉터리 생성 (`document/`, `backend/`, `frontend/`)
3. 하위 디렉터리 구조 생성

### Phase 2: 파일 이동 및 리네이밍
1. 기존 파일들을 새 구조로 이동
2. 파일명 규칙 적용 (camelCase)
3. 디렉터리명 규칙 적용 (UPPER_CASE)

### Phase 3: 경로 수정
1. `tsconfig.json` 경로 매핑 업데이트
2. `next.config.js` 별칭 설정
3. 모든 import 경로 수정

### Phase 4: 빌드 테스트
1. TypeScript 컴파일 확인
2. Next.js 빌드 테스트
3. 런타임 동작 확인

---

## 📊 영향도 분석

### 높은 영향도
- **모든 import 경로** 수정 필요
- **빌드 설정** 파일 수정 필요
- **TypeScript 설정** 업데이트 필요

### 중간 영향도
- **컴포넌트 구조** 재정리
- **API 경로** 재구성
- **스토어 구조** 재배치

### 낮은 영향도
- **기능 로직** 변경 없음
- **스타일링** 변경 없음
- **데이터베이스** 스키마 변경 없음

---

## ⏱️ 예상 소요 시간

### Option A (Next.js 호환): 2-3시간
- 디렉터리 생성: 30분
- 파일 이동/리네이밍: 1시간
- 경로 수정: 1-1.5시간
- 테스트/디버깅: 30분

### Option B (완전 재구성): 4-6시간
- 디렉터리 생성: 30분
- 파일 이동/리네이밍: 1.5시간
- 라우팅 재구현: 2-3시간
- 경로 수정: 1시간
- 테스트/디버깅: 1시간

---

## 🎯 권장사항

### 1. Option A 선택 권장
- Next.js 생태계 유지
- 개발 생산성 보장
- 안정성 확보

### 2. 단계적 마이그레이션
- 한 번에 모든 것을 변경하지 말고 단계별 진행
- 각 단계마다 빌드 테스트 수행
- 문제 발생 시 롤백 가능하도록 백업

### 3. 문서화 필수
- 변경 사항을 `document/` 디렉터리에 기록
- 마이그레이션 가이드 작성
- 새로운 구조 가이드 작성

---

## ❓ 확인 필요사항

1. **Next.js App Router 유지 여부**
   - 현재 라우팅 시스템을 유지할지?
   - 수동 라우팅으로 전환할지?

2. **빌드 시스템 선택**
   - Next.js 빌드 시스템 유지?
   - 커스텀 빌드 시스템 구축?

3. **개발 환경 영향**
   - Hot Reload 유지 여부?
   - 개발 서버 설정 변경 필요?

---

**작성일**: 2025년 10월 24일  
**작성자**: AI Assistant  
**검토 필요**: 사용자 승인 후 진행
