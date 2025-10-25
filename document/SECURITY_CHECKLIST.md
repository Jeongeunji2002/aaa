# 🔒 보안 체크리스트 - 정은지 게시판

## 📋 보안 점검 항목

---

## 1. 인증 & 인가 보안

### ✅ 현재 구현된 보안 기능

#### JWT 토큰 관리
- [x] Bearer Token 방식 사용
- [x] localStorage에 저장
- [x] 401 에러 시 자동 로그아웃
- [x] 모든 API 요청에 자동 토큰 추가

#### 소셜 로그인 보안
- [x] OAuth 2.0 State 파라미터 (CSRF 방지)
- [x] State 검증 로직
- [x] Authorization Code 플로우

### ⚠️ 개선 권장 사항

#### 1.1 토큰 저장소 보안 강화
**현재**: localStorage 사용
**문제점**: XSS 공격에 취약

**권장 개선**:
```typescript
// 옵션 1: HttpOnly Cookie 사용 (가장 안전)
// - 백엔드에서 Set-Cookie로 전송
// - JavaScript로 접근 불가
// - CSRF 토큰과 함께 사용

// 옵션 2: 짧은 만료시간 + Refresh Token
// - Access Token: 15분
// - Refresh Token: 7일 (HttpOnly Cookie)
```

**구현 예시**:
```typescript
// lib/api/axios.ts에 추가
apiClient.defaults.withCredentials = true; // Cookie 전송 허용
```

#### 1.2 토큰 만료 처리
**추가 필요**:
```typescript
// store/authStore.ts에 추가
interface AuthState {
  tokenExpiry: number | null;
  refreshToken: () => Promise<void>;
}

// 토큰 만료 5분 전 자동 갱신
setInterval(() => {
  const expiry = useAuthStore.getState().tokenExpiry;
  if (expiry && Date.now() > expiry - 5 * 60 * 1000) {
    useAuthStore.getState().refreshToken();
  }
}, 60000); // 1분마다 체크
```

#### 1.3 비밀번호 강도 검증 강화
**현재**: 최소 8자
**권장**: 
- 대소문자, 숫자, 특수문자 조합
- 일반적인 비밀번호 차단 (예: password123)

```typescript
// 추가할 Zod 스키마
password: z
  .string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
  .regex(/[A-Z]/, '대문자를 포함해야 합니다.')
  .regex(/[a-z]/, '소문자를 포함해야 합니다.')
  .regex(/[0-9]/, '숫자를 포함해야 합니다.')
  .regex(/[^A-Za-z0-9]/, '특수문자를 포함해야 합니다.'),
```

---

## 2. XSS (Cross-Site Scripting) 방어

### ✅ 현재 보호 수준
- [x] React 자동 이스케이핑
- [x] 사용자 입력 검증 (Zod)

### ⚠️ 추가 보안 조치

#### 2.1 Content Security Policy (CSP)
**구현 필요**:
```typescript
// next.config.ts 또는 middleware.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' https://front-mission.bigs.or.kr;
    `.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];
```

#### 2.2 DOMPurify로 HTML 살균
게시글 내용에 HTML이 포함될 수 있다면:
```bash
npm install dompurify @types/dompurify
```

```typescript
import DOMPurify from 'dompurify';

// 게시글 렌더링 시
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(board.content) 
}} />
```

---

## 3. CSRF (Cross-Site Request Forgery) 방어

### ✅ 현재 구현
- [x] 소셜 로그인: State 파라미터

### ⚠️ 추가 필요
- [ ] 일반 API: CSRF 토큰

**구현 방법**:
```typescript
// 백엔드에서 CSRF 토큰 발급 필요
// 프론트엔드에서 모든 변경 요청에 포함

// lib/api/axios.ts
apiClient.interceptors.request.use((config) => {
  const csrfToken = getCsrfToken(); // Cookie에서 읽기
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});
```

---

## 4. 파일 업로드 보안

### ✅ 현재 구현
- [x] 파일 크기 제한 (10MB)
- [x] 이미지 타입 검증 (클라이언트)

### ⚠️ 추가 필요

#### 4.1 파일 타입 검증 강화
```typescript
// components/boards/BoardForm.tsx 수정
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB로 축소 권장

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  
  if (file) {
    // 타입 검증
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('허용되지 않는 파일 형식입니다.');
      return;
    }
    
    // 크기 검증
    if (file.size > MAX_SIZE) {
      toast.error('파일 크기는 5MB 이하여야 합니다.');
      return;
    }
    
    // 파일 이름 검증 (특수문자, 경로 조작 방지)
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    // Magic Number 검증 (실제 파일 형식 확인)
    const reader = new FileReader();
    reader.onloadend = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer).subarray(0, 4);
      let header = '';
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
      }
      
      // JPEG: ffd8ffe0, PNG: 89504e47, GIF: 47494638
      const validHeaders = ['ffd8ffe0', 'ffd8ffe1', '89504e47', '47494638'];
      if (!validHeaders.some(h => header.startsWith(h.substring(0, 8)))) {
        toast.error('유효하지 않은 이미지 파일입니다.');
        return;
      }
    };
    reader.readAsArrayBuffer(file.slice(0, 4));
  }
};
```

#### 4.2 백엔드 검증 필수
- 서버에서도 파일 타입, 크기 재검증
- 파일 이름 살균 처리
- 바이러스 스캔 (ClamAV 등)

---

## 5. API 보안

### ✅ 현재 구현
- [x] HTTPS 사용 (API 서버)
- [x] Bearer Token 인증

### ⚠️ 추가 권장

#### 5.1 Rate Limiting (속도 제한)
클라이언트에서는 불가능하지만, 백엔드에서 필수:
- 로그인 시도: 5회/5분
- API 요청: 100회/분

#### 5.2 API 요청 재시도 로직
```typescript
// lib/api/axios.ts에 추가
import axiosRetry from 'axios-retry';

axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error)
      || error.response?.status === 429; // Rate limit
  }
});
```

---

## 6. 환경변수 보안

### ✅ 현재 상태
- [x] `.env.example` 제공
- [x] NEXT_PUBLIC_ 접두사 사용

### ⚠️ 주의사항

#### 6.1 민감 정보 노출 방지
```bash
# .env.local (Git에 커밋 금지!)
NEXT_PUBLIC_NAVER_CLIENT_ID=xxx
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx
# ...

# 절대 노출하면 안되는 정보 (백엔드에서만)
CLIENT_SECRET=xxx  # ❌ NEXT_PUBLIC_ 사용 금지!
DATABASE_URL=xxx   # ❌ 
```

#### 6.2 .gitignore 확인
```
.env.local
.env.development.local
.env.test.local
.env.production.local
```

---

## 7. 소셜 로그인 보안

### ✅ 현재 구현
- [x] State 파라미터 (CSRF 방지)
- [x] Authorization Code 플로우
- [x] Redirect URI 검증

### ⚠️ 추가 보안 조치

#### 7.1 Nonce 추가 (OpenID Connect)
```typescript
// lib/utils/socialConfig.ts 수정
export const generateOAuthUrl = (provider: SocialProvider): string => {
  const config = socialConfigs[provider];
  const state = crypto.randomUUID(); // 더 안전한 랜덤값
  const nonce = crypto.randomUUID(); // 추가
  
  localStorage.setItem(`oauth_state_${provider}`, state);
  localStorage.setItem(`oauth_nonce_${provider}`, nonce); // 추가
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope,
    state,
    nonce, // 추가
  });
  
  return `${config.authUrl}?${params.toString()}`;
};
```

#### 7.2 PKCE (Proof Key for Code Exchange)
공개 클라이언트에서 권장:
```typescript
// PKCE 구현 예시
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

function generateCodeChallenge(verifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}
```

---

## 8. 클라이언트 사이드 보안

### ⚠️ 추가 권장

#### 8.1 민감 정보 콘솔 로그 제거
프로덕션 빌드 시:
```typescript
// next.config.ts
const removeConsole = process.env.NODE_ENV === 'production';

module.exports = {
  compiler: {
    removeConsole: removeConsole ? {
      exclude: ['error', 'warn']
    } : false,
  },
};
```

#### 8.2 개발자 도구 감지 (선택사항)
```typescript
// 과도한 보안 조치일 수 있음
if (process.env.NODE_ENV === 'production') {
  const devtools = /./;
  devtools.toString = function() {
    this.opened = true;
  };
  
  setInterval(() => {
    if (devtools.opened) {
      console.log('%c개발자 도구가 감지되었습니다.', 'color: red; font-size: 20px;');
      // 경고만 표시 (차단하지 말 것)
    }
  }, 1000);
}
```

---

## 9. 의존성 보안

### 정기 점검 필요

#### 9.1 취약점 스캔
```bash
# npm audit 실행
npm audit

# 자동 수정
npm audit fix

# 강제 수정 (주의!)
npm audit fix --force
```

#### 9.2 의존성 업데이트
```bash
# outdated 패키지 확인
npm outdated

# 업데이트
npm update
```

#### 9.3 자동화 도구
- **Dependabot** (GitHub)
- **Snyk**
- **npm audit**

---

## 10. 프로덕션 배포 보안

### 배포 전 체크리스트

#### 10.1 환경 설정
- [ ] 프로덕션 환경변수 설정
- [ ] API URL 프로덕션으로 변경
- [ ] 소셜 로그인 Redirect URI 프로덕션으로 변경
- [ ] HTTPS 강제 설정

#### 10.2 빌드 최적화
```json
// package.json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "analyze": "ANALYZE=true next build"
  }
}
```

#### 10.3 보안 헤더 설정
```typescript
// middleware.ts 생성
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## 📊 보안 등급

### 현재 보안 수준: ⭐⭐⭐☆☆ (중급)

#### 강점
- ✅ JWT 인증 구현
- ✅ OAuth 2.0 State 검증
- ✅ 클라이언트 입력 검증
- ✅ React XSS 자동 방어

#### 개선 필요
- ⚠️ HttpOnly Cookie 미사용
- ⚠️ CSRF 토큰 미구현
- ⚠️ 보안 헤더 미설정
- ⚠️ 파일 업로드 검증 부족

---

## 🎯 우선순위별 개선 계획

### 🔴 높은 우선순위 (즉시)
1. **환경변수 보안 검증**
   - Client Secret 노출 확인
   - .gitignore 설정 확인

2. **HTTPS 강제**
   - 프로덕션 환경에서 필수

3. **토큰 만료 처리**
   - 자동 갱신 또는 로그아웃

### 🟡 중간 우선순위 (1주일 내)
4. **보안 헤더 설정**
   - CSP, X-Frame-Options 등

5. **파일 업로드 검증 강화**
   - Magic Number 검증
   - 백엔드 재검증

6. **Rate Limiting**
   - 백엔드에서 구현

### 🟢 낮은 우선순위 (1개월 내)
7. **HttpOnly Cookie 전환**
   - 백엔드 수정 필요

8. **PKCE 구현**
   - 소셜 로그인 보안 강화

9. **의존성 자동 스캔**
   - Dependabot 설정

---

## 🔍 보안 점검 명령어

```bash
# 1. 의존성 취약점 스캔
npm audit

# 2. 린트 검사
npm run lint

# 3. 타입 체크
npx tsc --noEmit

# 4. 빌드 테스트
npm run build

# 5. 보안 헤더 테스트 (배포 후)
curl -I https://yourdomain.com

# 6. SSL 인증서 확인 (배포 후)
openssl s_client -connect yourdomain.com:443
```

---

## 📚 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

---

**작성일**: 2025년 10월 24일  
**프로젝트**: 정은지 게시판 플랫폼  
**다음 점검 예정일**: 로그인 연동 완료 후

