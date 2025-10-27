// 쿠키 관리 유틸리티

import Cookies from 'js-cookie';
const USER_INFO_KEY = 'ui_user';

const isHttps = typeof window !== 'undefined' ? window.location.protocol === 'https:' : false;
const COOKIE_OPTIONS = {
  secure: isHttps, // 현재 페이지 프로토콜 기준 동적 설정
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
export const setUserInfo = (user: { userId?: string; name?: string }) => {
  const userId = typeof user?.userId === 'string' ? user.userId : '';
  const name = typeof user?.name === 'string' ? user.name : '';
  if (!userId) return;
  Cookies.set(USER_INFO_KEY, JSON.stringify({ userId, name }), COOKIE_OPTIONS);
  if (Cookies.get('client_user_info')) {
    Cookies.remove('client_user_info');
  }
  if (Cookies.get('user_info')) {
    Cookies.remove('user_info');
  }
};

// 사용자 정보 조회
export const getUserInfo = (): { userId: string; name: string } | null => {
  const legacyServer = Cookies.get('user_info');
  const legacyClient = Cookies.get('client_user_info');
  if (!Cookies.get(USER_INFO_KEY)) {
    const candidate = legacyClient || legacyServer;
    if (candidate) {
      try {
        const parsed = JSON.parse(candidate);
        if (parsed && typeof parsed.userId === 'string') {
          Cookies.set(
            USER_INFO_KEY,
            JSON.stringify({ userId: parsed.userId, name: parsed.name || '' }),
            COOKIE_OPTIONS
          );
          if (legacyClient) Cookies.remove('client_user_info');
          if (legacyServer) Cookies.remove('user_info');
        }
      } catch {}
    }
  }
  const userStr = Cookies.get(USER_INFO_KEY);
  if (!userStr) return null;
  
  try {
    const parsed = JSON.parse(userStr);
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.userId === 'string' &&
      parsed.userId.length > 0
    ) {
      return { userId: parsed.userId, name: typeof parsed.name === 'string' ? parsed.name : '' };
    }
    return null;
  } catch {
    return null;
  }
};

// 사용자 정보 삭제
export const removeUserInfo = () => {
  Cookies.remove(USER_INFO_KEY);
  Cookies.remove('client_user_info');
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

// 레거시 user_info 쿠키를 즉시 제거 (서버가 빈 {}로 내려 덮어쓰는 문제 예방)
export const purgeLegacyUserInfoCookie = () => {
  if (typeof window === 'undefined') return;
  let purged = false;
  if (typeof Cookies.get('user_info') !== 'undefined') { Cookies.remove('user_info'); purged = true; }
  if (typeof Cookies.get('client_user_info') !== 'undefined') { Cookies.remove('client_user_info'); purged = true; }
  if (purged) console.log('[cookie] purge legacy (user_info|client_user_info) removed');
};