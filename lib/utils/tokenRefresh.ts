// JWT 토큰 갱신 유틸리티

import { getAuthToken, setAuthToken, getRefreshToken, setRefreshToken, removeRefreshToken, setUserInfo } from './cookie';
import { apiClient } from '@/lib/api/axios';

interface TokenRefreshResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

/**
 * 토큰 만료 시간 확인
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // 만료 시간이 현재 시간보다 10분 이내면 갱신 필요
    return payload.exp - currentTime < 600; // 10분
  } catch {
    return true; // 토큰 파싱 실패 시 만료된 것으로 간주
  }
};

/**
 * 토큰 갱신 요청
 */
export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      console.warn('Refresh token이 없습니다.');
      return false;
    }

    const response = await apiClient.post<TokenRefreshResponse>('/auth/refresh', {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // 새 토큰 저장
    setAuthToken(accessToken);
    
    if (newRefreshToken) {
      setRefreshToken(newRefreshToken);
    }

    // 갱신 직후 사용자 정보 동기화 (쿠키/상태 업데이트)
    try {
      const meRes = await apiClient.get('/auth/me');
      const me = (meRes as any).data?.data || (meRes as any).data || {};
      const userId = typeof me.userId === 'string' ? me.userId.trim() : '';
      const name = typeof me.name === 'string' ? me.name.trim() : userId;
      if (userId) {
        const normalized = { userId, name };
        setUserInfo(normalized);
        if (typeof window !== 'undefined') {
          try {
            const mod = await import('@/store/authStore');
            mod.useAuthStore.setState({ user: normalized, token: accessToken });
          } catch {}
        }
      }
    } catch {}

    console.log('✅ 토큰 갱신 성공');
    return true;

  } catch (error: any) {
    console.error('❌ 토큰 갱신 실패:', error);
    
    // 갱신 실패 시 모든 인증 정보 삭제
    if (error.response?.status === 401) {
      clearAuthData();
    }
    
    return false;
  }
};

/**
 * 자동 토큰 갱신 스케줄러
 */
export const startTokenRefreshScheduler = () => {
  // 5분마다 토큰 만료 확인 (빈도 감소)
  const interval = setInterval(async () => {
    const token = getAuthToken();
    
    if (token && isTokenExpired(token)) {
      console.log('🔄 토큰 갱신 필요, 자동 갱신 시도...');
      const success = await refreshAccessToken();
      
      if (!success) {
        console.warn('토큰 갱신 실패, 스케줄러 중지');
        clearInterval(interval);
      }
    }
  }, 300000); // 5분

  return interval;
};

/**
 * 토큰 갱신 중 재시도 로직이 포함된 API 요청
 */
export const apiRequestWithRetry = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 1
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error: any) {
      lastError = error;

      // 401 에러이고 재시도 가능한 경우
      if (error.response?.status === 401 && attempt < maxRetries) {
        console.log(`🔄 401 에러 발생, 토큰 갱신 후 재시도 (${attempt + 1}/${maxRetries})`);
        
        const refreshSuccess = await refreshAccessToken();
        if (refreshSuccess) {
          continue; // 재시도
        }
      }

      // 재시도 불가능하거나 갱신 실패
      throw error;
    }
  }

  throw lastError;
};

/**
 * 모든 인증 데이터 정리
 */
export const clearAuthData = () => {
  // localStorage 정리 (기존 방식)
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  
  // 쿠키 정리 (새로운 방식)
  removeRefreshToken();
  
  // Zustand 스토어 정리
  if (typeof window !== 'undefined') {
    import('@/store/authStore').then(({ useAuthStore }) => {
      useAuthStore.getState().logout();
    });
  }
};

/**
 * 토큰 상태 확인
 */
export const getTokenStatus = () => {
  const accessToken = getAuthToken();
  const refreshToken = getRefreshToken();
  
  return {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    isAccessTokenExpired: accessToken ? isTokenExpired(accessToken) : true,
    canRefresh: !!refreshToken,
  };
};
