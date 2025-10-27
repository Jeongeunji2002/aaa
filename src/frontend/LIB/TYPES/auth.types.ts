// 인증 관련 타입 정의

export interface SignupData {
  userId: string;
  password: string;
  name: string;
  email?: string;
}

export interface LoginData {
  userId: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  userId: string;
  name: string;
  refreshToken?: string;
}

export interface User {
  userId: string;
  name: string;
}

