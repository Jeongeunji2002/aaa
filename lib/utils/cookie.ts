// 쿠키 관리 유틸리티

import Cookies from 'js-cookie';

const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production', // HTTPS에서만 전송
  sameSite: 'strict' as const, // CSRF 방지
  expires: 7, // 7일
};

// 토큰 저장 (HttpOnly Cookie 시뮬레이션)
export const setAuthToken = (token: string) => {
  Cookies.set('auth_token', token, COOKIE_OPTIONS);
};

// 토큰 조회
export const getAuthToken = (): string | undefined => {
  return Cookies.get('auth_token');
};

// 토큰 삭제
export const removeAuthToken = () => {
  Cookies.remove('auth_token');
};

// 사용자 정보 저장
export const setUserInfo = (user: { userId: string; name: string }) => {
  Cookies.set('user_info', JSON.stringify(user), COOKIE_OPTIONS);
};

// 사용자 정보 조회
export const getUserInfo = (): { userId: string; name: string } | null => {
  const userStr = Cookies.get('user_info');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// 사용자 정보 삭제
export const removeUserInfo = () => {
  Cookies.remove('user_info');
};

// CSRF 토큰 저장
export const setCsrfToken = (token: string) => {
  Cookies.set('csrf_token', token, {
    ...COOKIE_OPTIONS,
    httpOnly: false, // JavaScript에서 접근 가능해야 함
  });
};

// CSRF 토큰 조회
export const getCsrfToken = (): string | undefined => {
  return Cookies.get('csrf_token');
};

// CSRF 토큰 삭제
export const removeCsrfToken = () => {
  Cookies.remove('csrf_token');
};

// Refresh 토큰 저장
export const setRefreshToken = (token: string) => {
  Cookies.set('refresh_token', token, {
    ...COOKIE_OPTIONS,
    expires: 30, // 30일
  });
};

// Refresh 토큰 조회
export const getRefreshToken = (): string | undefined => {
  return Cookies.get('refresh_token');
};

// Refresh 토큰 삭제
export const removeRefreshToken = () => {
  Cookies.remove('refresh_token');
};

// 모든 인증 관련 쿠키 삭제
export const clearAllAuthCookies = () => {
  removeAuthToken();
  removeUserInfo();
  removeCsrfToken();
  removeRefreshToken();
};
