// 소셜 로그인 유틸리티 함수들

import axios from 'axios';

// 소셜 제공자별 설정
const SOCIAL_CONFIG = {
  naver: {
    clientId: process.env.NAVER_CLIENT_ID,
    clientSecret: process.env.NAVER_CLIENT_SECRET,
    tokenUrl: 'https://nid.naver.com/oauth2.0/token',
    userInfoUrl: 'https://openapi.naver.com/v1/nid/me',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
  },
  kakao: {
    clientId: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET,
    tokenUrl: 'https://kauth.kakao.com/oauth/token',
    userInfoUrl: 'https://kapi.kakao.com/v2/user/me',
  },
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    tokenUrl: 'https://discord.com/api/oauth2/token',
    userInfoUrl: 'https://discord.com/api/users/@me',
  },
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    userInfoUrl: 'https://api.twitter.com/2/users/me',
  },
};

// 소셜 제공자별 사용자 정보 가져오기
export async function getSocialUserData(provider: string, code: string) {
  try {
    const config = SOCIAL_CONFIG[provider as keyof typeof SOCIAL_CONFIG];
    
    if (!config || !config.clientId || !config.clientSecret) {
      console.error(`${provider} 설정이 없습니다. 환경 변수를 확인해주세요.`);
      return null;
    }

    // 1. Authorization Code로 Access Token 요청
    const tokenResponse = await axios.post(config.tokenUrl, {
      grant_type: 'authorization_code',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: `${process.env.FRONTEND_URL}/auth/callback/${provider}`,
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token } = tokenResponse.data;

    // 2. Access Token으로 사용자 정보 요청
    const userResponse = await axios.get(config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // 3. 제공자별 사용자 정보 파싱
    return parseUserData(provider, userResponse.data);

  } catch (error: any) {
    console.error(`${provider} 소셜 로그인 에러:`, error.response?.data || error.message);
    return null;
  }
}

// 제공자별 사용자 정보 파싱
function parseUserData(provider: string, data: any) {
  switch (provider) {
    case 'naver':
      return {
        id: data.response.id,
        name: data.response.name,
        email: data.response.email,
        profileImage: data.response.profile_image,
      };
    
    case 'google':
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        profileImage: data.picture,
      };
    
    case 'kakao':
      return {
        id: data.id.toString(),
        name: data.kakao_account?.profile?.nickname || data.kakao_account?.name,
        email: data.kakao_account?.email,
        profileImage: data.kakao_account?.profile?.profile_image_url,
      };
    
    case 'discord':
      return {
        id: data.id,
        name: data.username,
        email: data.email,
        profileImage: data.avatar ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png` : null,
      };
    
    case 'twitter':
      return {
        id: data.data.id,
        name: data.data.name,
        email: data.data.email,
        profileImage: data.data.profile_image_url,
      };
    
    default:
      return null;
  }
}

// 소셜 로그인 URL 생성
export function getSocialLoginUrl(provider: string, state?: string) {
  const config = SOCIAL_CONFIG[provider as keyof typeof SOCIAL_CONFIG];
  
  if (!config || !config.clientId) {
    throw new Error(`${provider} 설정이 없습니다.`);
  }

  const baseUrls = {
    naver: 'https://nid.naver.com/oauth2.0/authorize',
    google: 'https://accounts.google.com/o/oauth2/v2/auth',
    kakao: 'https://kauth.kakao.com/oauth/authorize',
    discord: 'https://discord.com/api/oauth2/authorize',
    twitter: 'https://twitter.com/i/oauth2/authorize',
  };

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: `${process.env.FRONTEND_URL}/auth/callback/${provider}`,
    response_type: 'code',
    scope: getScope(provider),
    ...(state && { state }),
  });

  return `${baseUrls[provider as keyof typeof baseUrls]}?${params.toString()}`;
}

// 제공자별 스코프 설정
function getScope(provider: string): string {
  const scopes = {
    naver: 'name,email',
    google: 'openid email profile',
    kakao: 'profile_nickname,account_email',
    discord: 'identify email',
    twitter: 'tweet.read users.read',
  };
  
  return scopes[provider as keyof typeof scopes] || '';
}