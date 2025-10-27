// 쿠키 관리 유틸리티

import Cookies from 'js-cookie';

const isHttps = typeof window !== 'undefined' ? window.location.protocol === 'https:' : false;
const COOKIE_OPTIONS = {
  secure: isHttps, // 현재 페이지 프로토콜 기준으로 동적 설정
  sameSite: 'strict' as const, // CSRF 방지
  expires: 7, // 7일
  path: '/', // 모든 경로에서 접근 가능하도록 보장
} as const;

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

const USER_INFO_KEY = 'user_info';

// 개발용: user_info에 빈 객체가 기록되는 문제를 추적하기 위한 트레이서
export const enableUserInfoDebugTracer = () => {
  if (typeof window === 'undefined') return;
  try {
    const originalSet = (Cookies.set as any).bind(Cookies);
    (Cookies as any).set = (key: string, value: any, options?: any) => {
      try {
        if (key === USER_INFO_KEY) {
          const serialized = typeof value === 'string' ? value : String(value);
          if (serialized === '{}' || serialized === '%7B%7D') {
            console.error('[cookie] 빈 user_info 쓰기 감지', new Error().stack);
          }
        }
      } catch {}
      return originalSet(key, value, options);
    };
  } catch {}
};

// 사용자 정보 저장
export const setUserInfo = (user?: { userId?: string; name?: string } | null) => {
  const prev = Cookies.get(USER_INFO_KEY) || Cookies.get('ui_user') || Cookies.get('client_user_info') || '';
  if (!user || typeof user !== 'object') {
    console.warn('[cookie] setUserInfo: 비객체/누락 입력. 기록 건너뜀. 입력값=', user, 'prev=', prev);
    return;
  }
  const rawId = (user.userId ?? '').toString();
  const rawNm = (user.name ?? '').toString();
  const uId = rawId.trim();
  const nm = rawNm.trim();

  // 둘 다 비어있으면 절대 쓰지 않음
  if (!uId && !nm) {
    console.warn('[cookie] setUserInfo: empty payload skip');
    return;
  }

  // 한쪽만 있으면 서로 보완
  const safe = { userId: uId || nm, name: nm || uId };
  const next = JSON.stringify(safe);
  try {
    Cookies.set(USER_INFO_KEY, next, COOKIE_OPTIONS);
    if (Cookies.get('ui_user')) Cookies.remove('ui_user');
    if (Cookies.get('client_user_info')) Cookies.remove('client_user_info');
    console.log('[cookie] setUserInfo(user_info) 저장 완료:', next);
  } catch (e) {
    console.error('[cookie] setUserInfo 저장 실패:', e);
  }
};

// 사용자 정보 조회
export const getUserInfo = (): { userId: string; name: string } | null => {
  // 마이그레이션: 구 키가 있으면 새 키로 옮긴다 (ui_user, client_user_info → user_info)
  const legacyUi = Cookies.get('ui_user');
  const legacyClient = Cookies.get('client_user_info');
  if (!Cookies.get(USER_INFO_KEY)) {
    const candidate = legacyUi || legacyClient;
    if (candidate) {
      try {
        const parsed = JSON.parse(candidate);
        if (parsed && typeof parsed.userId === 'string') {
          Cookies.set(
            USER_INFO_KEY,
            JSON.stringify({ userId: parsed.userId, name: parsed.name || '' }),
            COOKIE_OPTIONS
          );
          if (legacyUi) Cookies.remove('ui_user');
          if (legacyClient) Cookies.remove('client_user_info');
          console.log('[cookie] migrate (ui_user|client_user_info) → user_info 완료');
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
      const resolvedName = typeof parsed.name === 'string' && parsed.name.length > 0 ? parsed.name : parsed.userId;
      return { userId: parsed.userId, name: resolvedName };
    }
    // 비정상 형태면 무시
    return null;
  } catch {
    return null;
  }
};

// 사용자 정보 삭제
export const removeUserInfo = () => {
  Cookies.remove(USER_INFO_KEY);
  // 레거시 키도 함께 제거
  Cookies.remove('ui_user');
  Cookies.remove('client_user_info');
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
  // 레거시 쿠키 정리: ui_user, client_user_info
  if (typeof Cookies.get('ui_user') !== 'undefined') {
    Cookies.remove('ui_user');
    purged = true;
  }
  if (typeof Cookies.get('client_user_info') !== 'undefined') {
    Cookies.remove('client_user_info');
    purged = true;
  }
  if (purged) console.log('[cookie] purge legacy (ui_user|client_user_info) removed');
};
