// 소셜 로그인 관련 타입 정의

export type SocialProvider = 'naver' | 'google' | 'kakao' | 'discord' | 'twitter';

export interface SocialLoginRequest {
  provider: SocialProvider;
  code: string;
  state?: string;
}

export interface SocialLoginResponse {
  accessToken: string;
  userId: string;
  name: string;
  email?: string;
  provider: SocialProvider;
}

export interface SocialProfile {
  id: string;
  email?: string;
  name?: string;
  profileImage?: string;
  provider: SocialProvider;
}

