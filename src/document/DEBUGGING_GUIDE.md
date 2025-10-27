# 🔍 회원가입 실패 디버깅 가이드

## 🚨 현재 상황

### ✅ **정상 동작하는 부분**
- 프론트엔드 서버: `http://localhost:8080` ✅
- 빌드: 성공 ✅
- TypeScript 컴파일: 성공 ✅
- 보안 기능: 구현 완료 ✅

### ❌ **문제가 있는 부분**
- 백엔드 서버: `http://localhost:3001` ❌
- 데이터베이스 연결: 미설정 ❌
- 회원가입 API: 연결 불가 ❌

---

## 🔧 문제 해결 방법

### 1. **백엔드 서버 문제**

#### 문제점
- 백엔드 서버가 시작되지 않음
- Prisma 클라이언트 초기화 실패
- 환경 변수 설정 문제

#### 해결 방법
```bash
# 1. 서버 디렉토리로 이동
cd server

# 2. 환경 변수 설정
$env:PORT="3001"
$env:NODE_ENV="development"
$env:JWT_SECRET="test-secret-key"
$env:JWT_REFRESH_SECRET="test-refresh-secret"
$env:DATABASE_URL="postgresql://test:test@localhost:5432/test"

# 3. 서버 시작
npm run dev
```

### 2. **데이터베이스 연결 문제**

#### 현재 설정
- **Prisma 스키마**: PostgreSQL로 변경됨
- **데이터베이스**: 실제 DB 연결 필요

#### 해결 방법
```bash
# 1. PostgreSQL 설치 및 실행
# 2. 데이터베이스 생성
createdb jeongeunji

# 3. 환경 변수 설정
DATABASE_URL="postgresql://username:password@localhost:5432/jeongeunji"

# 4. Prisma 마이그레이션
npx prisma db push
```

### 3. **회원가입 테스트 방법**

#### 프론트엔드에서 테스트
1. **브라우저 접속**: `http://localhost:8080/signup`
2. **회원가입 폼 작성**:
   - 아이디: `testuser`
   - 비밀번호: `password123`
   - 이름: `테스트 사용자`
   - 이메일: `test@example.com`
3. **에러 확인**: 개발자 도구 → Network 탭에서 API 호출 확인

#### 예상 에러
```json
{
  "error": "Network Error",
  "message": "원격 서버에 연결할 수 없습니다."
}
```

---

## 🛠️ 임시 해결 방법

### 1. **Mock API 서버 생성**

백엔드 없이 테스트하기 위해 간단한 Mock 서버를 만들 수 있습니다:

```javascript
// mock-server.js
const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

// Mock 회원가입 API
app.post('/api/auth/signup', (req, res) => {
  console.log('회원가입 요청:', req.body);
  res.json({
    success: true,
    message: '회원가입이 완료되었습니다.',
    data: {
      id: 'mock-user-id',
      userId: req.body.userId,
      name: req.body.name,
      email: req.body.email,
      createdAt: new Date().toISOString()
    }
  });
});

// Mock 로그인 API
app.post('/api/auth/login', (req, res) => {
  console.log('로그인 요청:', req.body);
  res.json({
    success: true,
    message: '로그인 성공',
    data: {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: {
        userId: req.body.userId,
        name: '테스트 사용자'
      }
    }
  });
});

// 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Mock 서버가 실행 중입니다.'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock 서버가 포트 ${PORT}에서 실행 중입니다.`);
});
```

### 2. **Mock 서버 실행**
```bash
# Mock 서버 실행
node mock-server.js

# 테스트
curl http://localhost:3001/api/health
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","password":"123456","name":"테스트","email":"test@example.com"}'
```

---

## 🔍 디버깅 체크리스트

### ✅ **프론트엔드 확인**
- [ ] `http://localhost:8080` 접속 가능
- [ ] 회원가입 페이지 로드 확인
- [ ] 폼 입력 및 제출 테스트
- [ ] 개발자 도구에서 네트워크 요청 확인

### ✅ **백엔드 확인**
- [ ] `http://localhost:3001/api/health` 응답 확인
- [ ] 환경 변수 설정 확인
- [ ] Prisma 클라이언트 생성 확인
- [ ] 서버 로그 확인

### ✅ **API 연결 확인**
- [ ] 프론트엔드 → 백엔드 API 호출 확인
- [ ] CORS 설정 확인
- [ ] 요청/응답 데이터 형식 확인

---

## 📊 현재 상태 요약

### **프론트엔드**: ✅ 완료
- Next.js 16 + React 19
- TypeScript + TailwindCSS
- 보안 기능 (HttpOnly Cookie, CSRF, 파일 검증)
- 회원가입/로그인 UI
- 게시판 CRUD UI
- 소셜 로그인 UI

### **백엔드**: ⚠️ 부분 완료
- Express.js 서버 코드 ✅
- API 엔드포인트 구현 ✅
- 보안 미들웨어 ✅
- **서버 실행**: ❌ (환경 설정 필요)
- **데이터베이스**: ❌ (연결 필요)

### **데이터베이스**: ❌ 미설정
- Prisma 스키마 정의 ✅
- **실제 DB 연결**: ❌
- **마이그레이션**: ❌

---

## 🎯 다음 단계

### **즉시 해결 가능**
1. **Mock 서버 실행** - 백엔드 없이 프론트엔드 테스트
2. **환경 변수 설정** - 백엔드 서버 정상 실행
3. **PostgreSQL 설치** - 실제 데이터베이스 연결

### **장기 해결**
1. **오라클 DB 연결** - 원래 계획대로
2. **소셜 로그인 실제 연동** - OAuth 제공자 API
3. **프로덕션 배포** - 실제 서버 환경

---

## 🚀 빠른 테스트 방법

### **1단계: Mock 서버로 테스트**
```bash
# Mock 서버 생성 및 실행
node mock-server.js

# 프론트엔드에서 회원가입 테스트
# http://localhost:8080/signup
```

### **2단계: 실제 백엔드 연결**
```bash
# PostgreSQL 설치 후
# 환경 변수 설정
# 백엔드 서버 실행
# 프론트엔드에서 실제 API 테스트
```

---

**💡 현재 회원가입 실패의 주요 원인은 백엔드 서버가 실행되지 않아서 API 호출이 실패하는 것입니다. Mock 서버를 사용하면 프론트엔드 기능을 먼저 테스트할 수 있습니다.**
