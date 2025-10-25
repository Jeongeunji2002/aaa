// 소셜 로그인 설정

import type { SocialProvider } from '@/types/social.types';

interface SocialConfig {
  clientId: string;
  redirectUri: string;
  authUrl: string;
  scope: string;
}

// 환경변수에서 가져오거나 기본값 사용
const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080';
const REDIRECT_URI = `${BASE_URL}/auth/callback`;

// 각 소셜 플랫폼별 설정
// 실제 사용 시 환경변수로 관리해야 합니다
export const socialConfigs: Record<SocialProvider, SocialConfig> = {
  naver: {
    clientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || 'YOUR_NAVER_CLIENT_ID',
    redirectUri: `${REDIRECT_URI}/naver`,
    authUrl: 'https://nid.naver.com/oauth2.0/authorize',
    scope: 'name,email',
  },
  google: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
    redirectUri: `${REDIRECT_URI}/google`,
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope: 'openid profile email',
  },
  kakao: {
    clientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || 'YOUR_KAKAO_CLIENT_ID',
    redirectUri: `${REDIRECT_URI}/kakao`,
    authUrl: 'https://kauth.kakao.com/oauth/authorize',
    scope: 'profile_nickname,account_email',
  },
  discord: {
    clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || 'YOUR_DISCORD_CLIENT_ID',
    redirectUri: `${REDIRECT_URI}/discord`,
    authUrl: 'https://discord.com/api/oauth2/authorize',
    scope: 'identify email',
  },
  twitter: {
    clientId: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || 'YOUR_TWITTER_CLIENT_ID',
    redirectUri: `${REDIRECT_URI}/twitter`,
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    scope: 'tweet.read users.read',
  },
};

// OAuth URL 생성
export const generateOAuthUrl = (provider: SocialProvider): string => {
  const config = socialConfigs[provider];
  const state = Math.random().toString(36).substring(7);
  
  // localStorage에 state 저장 (CSRF 방지)
  if (typeof window !== 'undefined') {
    localStorage.setItem(`oauth_state_${provider}`, state);
  }
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope,
    state,
  });
  
  return `${config.authUrl}?${params.toString()}`;
};

// 소셜 플랫폼 정보
interface PlatformInfo {
  name: string;
  color: string;
  textColor?: string;
  icon: string;
}

export const socialPlatforms: Record<SocialProvider, PlatformInfo> = {
  naver: {
    name: '네이버',
    color: '#03C75A',
    icon: 'N',
  },
  google: {
    name: '구글',
    color: '#4285F4',
    icon: 'G',
  },
  kakao: {
    name: '카카오',
    color: '#FEE500',
    textColor: '#000000',
    icon: 'K',
  },
  discord: {
    name: '디스코드',
    color: '#5865F2',
    icon: 'D',
  },
  twitter: {
    name: '트위터',
    color: '#1DA1F2',
    icon: '𝕏',
  },
};

