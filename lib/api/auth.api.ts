// 인증 관련 API

import { apiClient } from './axios';
import type { SignupData, LoginData, LoginResponse } from '@/types';

// 회원가입
export const signup = async (data: SignupData): Promise<void> => {
  const response = await apiClient.post('/auth/signup', data);
  return response.data;
};

// 로그인
export const login = async (data: LoginData): Promise<LoginResponse> => {
  const response = await apiClient.post('/auth/login', data);
  const payload = response.data?.data || {};
  // 서버 응답: { accessToken, refreshToken, user: { userId, name } }
  let userId = payload.user?.userId as string | undefined;
  let name = payload.user?.name as string | undefined;

  // 일부 환경(모의 서버/구버전)에서 user 필드가 없을 수 있어 보강
  if (!userId || !name) {
    try {
      const meRes = await apiClient.get('/auth/me');
      const me = meRes.data?.data || {};
      userId = userId || me.userId;
      name = name || me.name;
    } catch {}
  }

  return {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    userId: userId as string,
    name: name as string,
  } as LoginResponse;
};

