# 소셜 로그인 설정 가이드

## 📱 지원하는 소셜 플랫폼

- 네이버 (Naver)
- 구글 (Google)
- 카카오 (Kakao)
- 디스코드 (Discord)
- 트위터 (Twitter / X)

---

## 🔧 소셜 로그인 설정 방법

### 1. 네이버 로그인 설정

#### 애플리케이션 등록
1. [네이버 개발자 센터](https://developers.naver.com/apps/#/register) 접속
2. "애플리케이션 등록" 클릭
3. 애플리케이션 정보 입력:
   - **애플리케이션 이름**: 정은지
   - **사용 API**: 네이버 로그인
   - **제공 정보**: 회원이름, 이메일

#### Callback URL 설정
```
http://localhost:8080/auth/callback/naver
```

프로덕션:
```
https://yourdomain.com/auth/callback/naver
```

#### 환경변수 설정
`.env.local` 파일에 추가:
```env
NEXT_PUBLIC_NAVER_CLIENT_ID=your_naver_client_id
```

---

### 2. 구글 로그인 설정

#### OAuth 2.0 클라이언트 ID 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성
3. "API 및 서비스" > "사용자 인증 정보" 이동
4. "사용자 인증 정보 만들기" > "OAuth 클라이언트 ID" 선택
5. 애플리케이션 유형: 웹 애플리케이션

#### 승인된 리디렉션 URI
```
http://localhost:8080/auth/callback/google
https://yourdomain.com/auth/callback/google
```

#### 환경변수 설정
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

---

### 3. 카카오 로그인 설정

#### 애플리케이션 추가
1. [Kakao Developers](https://developers.kakao.com/) 접속
2. "내 애플리케이션" > "애플리케이션 추가하기"
3. 앱 이름: 정은지

#### 플랫폼 설정
- "플랫폼" > "Web" 추가
- 사이트 도메인 등록

#### Redirect URI 설정
"카카오 로그인" > "Redirect URI" 등록:
```
http://localhost:8080/auth/callback/kakao
https://yourdomain.com/auth/callback/kakao
```

#### 동의 항목 설정
"카카오 로그인" > "동의항목"에서 설정:
- 닉네임 (필수)
- 카카오계정(이메일) (선택)

#### 환경변수 설정
```env
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_rest_api_key
```

---

### 4. 디스코드 로그인 설정

#### 애플리케이션 생성
1. [Discord Developer Portal](https://discord.com/developers/applications) 접속
2. "New Application" 클릭
3. 애플리케이션 이름: 정은지

#### OAuth2 설정
"OAuth2" 메뉴로 이동:
- Redirects 추가:
```
http://localhost:8080/auth/callback/discord
https://yourdomain.com/auth/callback/discord
```

#### 권한 설정
OAuth2 URL Generator에서:
- Scopes: `identify`, `email`

#### 환경변수 설정
```env
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id
```

---

### 5. 트위터 (X) 로그인 설정

#### 앱 생성
1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard) 접속
2. "Projects & Apps" > "Create App"
3. 앱 이름: 정은지

#### OAuth 2.0 설정
"User authentication settings" 편집:
- App permissions: Read
- Type of App: Web App
- Callback URI:
```
http://localhost:8080/auth/callback/twitter
https://yourdomain.com/auth/callback/twitter
```

#### 환경변수 설정
```env
NEXT_PUBLIC_TWITTER_CLIENT_ID=your_twitter_client_id
```

---

## 🔐 백엔드 API 연동

소셜 로그인이 완전히 작동하려면 백엔드 API에서 다음 엔드포인트를 지원해야 합니다:

### POST /auth/social/login

**Request:**
```json
{
  "provider": "naver" | "google" | "kakao" | "discord" | "twitter",
  "code": "authorization_code",
  "state": "random_state" // CSRF 방지용
}
```

**Response:**
```json
{
  "accessToken": "jwt_token",
  "userId": "user_id",
  "name": "사용자 이름",
  "email": "user@example.com",
  "provider": "naver"
}
```

### 백엔드 구현 예시 (개념)

```typescript
// 1. Code를 받아서 각 플랫폼의 Token 엔드포인트로 Access Token 요청
// 2. Access Token으로 사용자 정보 조회
// 3. 기존 사용자면 로그인, 신규면 회원가입 처리
// 4. JWT 토큰 발급하여 반환
```

---

## 🧪 테스트 방법

### 1. 환경변수 설정
`.env.local` 파일 생성 후 Client ID 입력

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. 소셜 로그인 테스트
1. http://localhost:8080/login 접속
2. 원하는 소셜 플랫폼 버튼 클릭
3. 해당 플랫폼 로그인 페이지로 리다이렉트
4. 로그인 후 앱으로 돌아오기
5. 백엔드 API 연동 필요

---

## ⚠️ 주의사항

1. **Client Secret 보안**
   - Client Secret은 절대 프론트엔드에 노출하지 마세요
   - 백엔드에서만 사용해야 합니다

2. **Redirect URI 정확성**
   - 각 플랫폼에 등록한 Redirect URI와 코드의 URI가 정확히 일치해야 합니다

3. **HTTPS 필수**
   - 프로덕션 환경에서는 반드시 HTTPS 사용
   - 일부 플랫폼은 HTTPS를 강제합니다

4. **CSRF 방지**
   - State 파라미터로 CSRF 공격 방지
   - 코드에 이미 구현되어 있습니다

5. **백엔드 필수**
   - 소셜 로그인은 반드시 백엔드 API가 필요합니다
   - 프론트엔드만으로는 완전한 구현이 불가능합니다

---

## 🎨 UI 커스터마이징

각 소셜 플랫폼의 색상과 아이콘은 `lib/utils/socialConfig.ts`에서 변경 가능:

```typescript
export const socialPlatforms = {
  naver: {
    name: '네이버',
    color: '#03C75A',
    icon: 'N',
  },
  // ...
}
```

---

## 📚 참고 문서

- [네이버 로그인 API](https://developers.naver.com/docs/login/overview/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Kakao Login](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [Discord OAuth2](https://discord.com/developers/docs/topics/oauth2)
- [Twitter OAuth 2.0](https://developer.twitter.com/en/docs/authentication/oauth-2-0)

---

**작성일**: 2025년 10월 24일  
**프로젝트**: 정은지 게시판 플랫폼

