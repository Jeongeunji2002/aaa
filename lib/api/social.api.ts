// 소셜 로그인 관련 API

import { apiClient } from './axios';
import type { SocialLoginRequest, SocialLoginResponse } from '@/types/social.types';

// 소셜 로그인 (OAuth 콜백 후 호출)
export const socialLogin = async (data: SocialLoginRequest): Promise<SocialLoginResponse> => {
  const response = await apiClient.post('/social/login', data);
  return response.data.data; // 백엔드 응답 구조에 맞게 수정
};

// 소셜 계정 연동
export const linkSocialAccount = async (data: SocialLoginRequest): Promise<void> => {
  await apiClient.post('/auth/social/link', data);
};

// 소셜 계정 연동 해제
export const unlinkSocialAccount = async (provider: string): Promise<void> => {
  await apiClient.delete(`/auth/social/unlink/${provider}`);
};

