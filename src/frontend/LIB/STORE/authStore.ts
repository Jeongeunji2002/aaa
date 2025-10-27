// Zustand 인증 스토어

import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import { login as apiLogin, signup as apiSignup } from '@/src/FRONTEND/LIB/API';
import { 
  setAuthToken, 
  getAuthToken, 
  removeAuthToken,
  setUserInfo,
  getUserInfo,
  removeUserInfo,
  setRefreshToken,
  getRefreshToken,
  removeRefreshToken,
  clearAllAuthCookies
} from '@/src/FRONTEND/LIB/UTILS/cookie';
import { initializeCsrfToken } from '@/src/FRONTEND/LIB/UTILS/csrf';
import { startTokenRefreshScheduler } from '@/src/FRONTEND/LIB/UTILS/tokenRefresh';
import type { User, SignupData, LoginData } from '@/src/FRONTEND/LIB/TYPES';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  refreshScheduler: NodeJS.Timeout | null;
  
  // Actions
  initialize: () => void;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  signup: (data: SignupData) => Promise<void>;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  clearTokens: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: false,
  isInitialized: false,
  refreshScheduler: null,
  
  // 앱 시작 시 쿠키에서 토큰과 사용자 정보 복원
  initialize: () => {
    if (typeof window !== 'undefined') {
      // CSRF 토큰 초기화
      initializeCsrfToken();
      
      // 쿠키에서 토큰과 사용자 정보 복원
      const token = getAuthToken();
      const user = getUserInfo();
      
      set({
        token,
        user,
        isInitialized: true,
      });
      
          // 토큰 갱신 스케줄러는 일시적으로 비활성화
          // if (token) {
          //   const scheduler = startTokenRefreshScheduler();
          //   set({ refreshScheduler: scheduler });
          // }
    }
  },
  
  // 로그인
  login: async (data: LoginData) => {
    try {
      set({ isLoading: true });
      
      const response = await apiLogin(data);
      const { accessToken, userId, name, refreshToken } = response;
      
      // 쿠키에 저장
      setAuthToken(accessToken);
      setUserInfo({ userId, name });
      
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }
      
      // 상태 업데이트
      set({
        token: accessToken,
        user: { userId, name },
        isLoading: false,
      });
      
          // 토큰 갱신 스케줄러는 일시적으로 비활성화
          // const scheduler = startTokenRefreshScheduler();
          // set({ refreshScheduler: scheduler });
      
      toast.success('로그인 성공!');
    } catch (error: any) {
      set({ isLoading: false });
      
      const errorMessage = error.response?.data?.message || '로그인에 실패했습니다.';
      toast.error(errorMessage);
      
      throw error;
    }
  },
  
  // 로그아웃
  logout: () => {
    const { refreshScheduler } = get();
    
    // 스케줄러 정리
    if (refreshScheduler) {
      clearInterval(refreshScheduler);
    }
    
    // 모든 인증 데이터 정리
    clearAllAuthCookies();
    
    // 상태 초기화
    set({
      token: null,
      user: null,
      refreshScheduler: null,
    });
    
    toast.success('로그아웃되었습니다.');
  },
  
  // 토큰 설정 (토큰 갱신 시 사용)
  setTokens: (accessToken: string, refreshToken?: string) => {
    setAuthToken(accessToken);
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
    
    set({ token: accessToken });
  },
  
  // 토큰 정리
  clearTokens: () => {
    removeAuthToken();
    removeRefreshToken();
    set({ token: null });
  },
  
  // 회원가입
  signup: async (data: SignupData) => {
    try {
      set({ isLoading: true });
      
      await apiSignup(data);
      
      set({ isLoading: false });
      
      toast.success('회원가입이 완료되었습니다. 로그인해주세요.');
    } catch (error: any) {
      set({ isLoading: false });
      
      const errorMessage = error.response?.data?.message || '회원가입에 실패했습니다.';
      toast.error(errorMessage);
      
      throw error;
    }
  },
}));

