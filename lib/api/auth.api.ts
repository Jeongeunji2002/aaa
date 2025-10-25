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
  return response.data.data; // 백엔드 응답 구조에 맞게 수정
};

