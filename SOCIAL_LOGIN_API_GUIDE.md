# 🔐 소셜 로그인 API 연동 가이드

## 📋 **수정해야 할 파일들**

### **1. 서버 환경 변수 설정**
`server/.env` 파일에 다음 환경 변수들을 추가해야 합니다:

```bash
# 네이버
NAVER_CLIENT_ID=W_Jt2WRm1ufszyl0yxCo
NAVER_CLIENT_SECRET=VlJjS15SoE

# 구글
GOOGLE_CLIENT_ID=824254760225-grlgb236dqc5i75gahucjghbfqoa2rf4.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# 카카오
KAKAO_CLIENT_ID=c0aea9341ee62c811d788d26d480d994
KAKAO_CLIENT_SECRET=nyMg3W7O5D59RYoesC54suAK7hQulJRo

# 디스코드
DISCORD_CLIENT_ID=1432070326564687902
DISCORD_CLIENT_SECRET=30LC0gmcvK7iy0G-pzHlwkL8wFhttGH0

# 트위터
TWITTER_CLIENT_ID=HsokMIRIpOQ0p6HKwPetCxKiu
TWITTER_CLIENT_SECRET=Xuwi7OpJrptHcRbwMElYeWFHhDgjbhJVMdBAZDdYnmsCJjmssZ

# 기타 설정
FRONTEND_URL=http://localhost:8080
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
DATABASE_URL=postgresql://postgres:password@localhost:5434/jeongeunji
```

### **2. 소셜 로그인 유틸리티 함수**
`server/utils/socialAuth.ts` - ✅ **이미 생성됨**

이 파일에는 다음 함수들이 포함되어 있습니다:
- `getSocialUserData()`: 실제 OAuth API 호출
- `parseUserData()`: 제공자별 사용자 정보 파싱
- `getSocialLoginUrl()`: 소셜 로그인 URL 생성

### **3. 소셜 로그인 라우터**
`server/routes/social.ts` - ✅ **이미 수정됨**

실제 OAuth 제공자와 연동하도록 수정되었습니다.

---

## 🚀 **OAuth 제공자별 설정 방법**

### **1. 네이버 (Naver)**
1. [네이버 개발자 센터](https://developers.naver.com/) 접속
2. 애플리케이션 등록
3. 서비스 URL: `http://localhost:8080`
4. Callback URL: `http://localhost:8080/auth/callback/naver`
5. Client ID, Client Secret 복사

### **2. 구글 (Google)**
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 및 OAuth 2.0 클라이언트 ID 생성
3. 승인된 리디렉션 URI: `http://localhost:8080/auth/callback/google`
4. Client ID, Client Secret 복사

### **3. 카카오 (Kakao)**
1. [카카오 개발자 센터](https://developers.kakao.com/) 접속
2. 애플리케이션 등록
3. 플랫폼 설정에서 Web 플랫폼 추가
4. Redirect URI: `http://localhost:8080/auth/callback/kakao`
5. Client ID, Client Secret 복사

### **4. 디스코드 (Discord)**
1. [Discord Developer Portal](https://discord.com/developers/applications) 접속
2. New Application 생성
3. OAuth2 > General에서 Redirect 추가: `http://localhost:8080/auth/callback/discord`
4. Client ID, Client Secret 복사

### **5. 트위터 (Twitter)**
1. [Twitter Developer Portal](https://developer.twitter.com/) 접속
2. 프로젝트 생성 및 앱 생성
3. OAuth 2.0 설정에서 Callback URL: `http://localhost:8080/auth/callback/twitter`
4. Client ID, Client Secret 복사

---

## 🔧 **수정해야 할 코드 위치**

### **1. 환경 변수 설정**
```bash
# server/.env 파일에 실제 OAuth 제공자 정보 입력
NAVER_CLIENT_ID=실제_네이버_클라이언트_ID
NAVER_CLIENT_SECRET=실제_네이버_클라이언트_시크릿
# ... 다른 제공자들도 동일하게
```

### **2. 프론트엔드 소셜 로그인 버튼**
`lib/utils/socialConfig.ts` - ✅ **이미 올바르게 설정됨**

프론트엔드는 이미 실제 OAuth URL을 사용하도록 설정되어 있습니다.

### **3. 백엔드 소셜 로그인 라우터**
`server/routes/social.ts` - ✅ **이미 수정됨**

다음 엔드포인트들이 추가되었습니다:
- `GET /api/social/auth/:provider` - OAuth URL 생성
- `POST /api/social/login` - 실제 OAuth 토큰 교환 및 사용자 정보 처리

---

## 📝 **작업 순서**

1. **OAuth 제공자에서 앱 등록** (위 가이드 참조)
2. **환경 변수 설정** (`server/.env` 파일 수정)
3. **테스트** (각 제공자별 로그인 테스트)

**✅ 모든 코드 수정이 완료되었습니다!**

---

## ⚠️ **주의사항**

- **보안**: Client Secret은 절대 프론트엔드에 노출되지 않도록 주의
- **환경 변수**: `.env` 파일은 `.gitignore`에 포함되어야 함
- **프로덕션**: 실제 서비스에서는 HTTPS 사용 필수
- **도메인**: 실제 도메인으로 변경 시 모든 OAuth 제공자에서 Callback URL 업데이트 필요

---

**🎯 이제 실제 OAuth 제공자 정보를 입력하고 테스트할 수 있습니다!**