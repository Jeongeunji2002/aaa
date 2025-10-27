// CSRF 토큰 관리 유틸리티

import { setCsrfToken, getCsrfToken, removeCsrfToken } from './cookie';

/**
 * CSRF 토큰 생성
 */
export const generateCsrfToken = (): string => {
  // 암호학적으로 안전한 랜덤 토큰 생성
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  
  // Base64 URL 인코딩
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

/**
 * CSRF 토큰 초기화 및 저장
 */
export const initializeCsrfToken = (): string => {
  const token = generateCsrfToken();
  setCsrfToken(token);
  return token;
};

/**
 * CSRF 토큰 검증
 */
export const validateCsrfToken = (providedToken: string): boolean => {
  const storedToken = getCsrfToken();
  
  if (!storedToken || !providedToken) {
    return false;
  }
  
  // 시간 상수 비교 (타이밍 공격 방지)
  return constantTimeCompare(storedToken, providedToken);
};

/**
 * 시간 상수 문자열 비교 (타이밍 공격 방지)
 */
const constantTimeCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
};

/**
 * API 요청용 CSRF 토큰 헤더 생성
 */
export const getCsrfHeader = (): Record<string, string> => {
  const token = getCsrfToken();
  return token ? { 'X-CSRF-Token': token } : {};
};

/**
 * CSRF 토큰 정리
 */
export const clearCsrfToken = () => {
  removeCsrfToken();
};
