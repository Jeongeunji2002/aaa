// Zustand 인증 스토어

import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import { login as apiLogin, signup as apiSignup } from '@/lib/api';
import { apiClient } from '@/lib/api/axios';
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
  clearAllAuthCookies,
  purgeLegacyUserInfoCookie
} from '@/lib/utils/cookie';
import { initializeCsrfToken } from '@/lib/utils/csrf';
import { startTokenRefreshScheduler } from '@/lib/utils/tokenRefresh';
import type { User, SignupData, LoginData } from '@/types';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  refreshScheduler: NodeJS.Timeout | null;
  
  // Actions
  initialize: () => Promise<void>;
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
  initialize: async () => {
    if (typeof window !== 'undefined') {
      // 레거시 user_info 즉시 제거 (서버가 덮어쓰는 문제 차단)
      try { purgeLegacyUserInfoCookie(); } catch {}
      // CSRF 토큰 초기화
      initializeCsrfToken();
      
      // 쿠키에서 토큰과 사용자 정보 복원
      const token = getAuthToken();
      // 디버그: JWT 페이로드 출력
      try {
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1] || ''));
          console.log('[auth:init] JWT payload:', payload);
        }
      } catch (e) {
        console.warn('[auth:init] JWT 디코드 실패');
      }
      let user = getUserInfo();
      console.log('[auth:init] cookie ui_user:', user);

      // 쿠키에서 읽은 사용자 정보 정규화 (빈 값 방지)
      if (user) {
        const uid = (user.userId || '').trim();
        const nm = (user.name || '').trim();
        if (!uid) {
          user = null;
        } else {
          user = { userId: uid, name: nm || uid };
        }
      }

      set({ token, user, isInitialized: true });

      // 토큰은 있는데 쿠키의 사용자 정보가 비어있거나(userId/name 누락)하면 서버에서 보강
      if (token && (!user || !user.userId || !user.name)) {
        try {
          const me = await apiClient.get('/auth/me');
          const fetched = {
            userId: me.data?.data?.userId ?? me.data?.userId,
            name: me.data?.data?.name ?? me.data?.name ?? '',
          } as { userId: string; name: string };
          if (fetched.userId) {
            setUserInfo({ userId: fetched.userId, name: fetched.name || fetched.userId });
            user = { userId: fetched.userId, name: fetched.name || fetched.userId };
            set({ user });
          } else {
            console.warn('[auth:init] /auth/me 응답에 userId 없음:', me.data);
          }
        } catch (e: any) {
          console.error('[auth:init] /auth/me 실패:', e?.response?.status, e?.response?.data?.message || e?.message);
        }
      }

      // 토큰이 있으면 항상 서버에서 사용자 정보 동기화
      if (token) {
        try {
          const res = await apiClient.get('/auth/me');
          const me = res.data?.data;
          if (me?.userId) {
            const normalized = { userId: me.userId, name: me.name || me.userId };
            setUserInfo(normalized);
            set({ user: normalized });
            console.log('[auth:init] ui_user 동기화 완료:', normalized);
          }
        } catch (e: any) {
          console.error('[auth:init] /auth/me 동기화 실패:', e?.response?.status, e?.response?.data?.message || e?.message);
        }
      }

      // 최종 폴백: 여전히 사용자 정보가 없다면 JWT 페이로드에서 userLoginId 사용
      if (token && !get().user) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1] || '')) || {};
          const loginId = (payload.userLoginId || payload.sub || '').trim();
          if (loginId) {
            const normalized = { userId: loginId, name: loginId };
            setUserInfo(normalized);
            set({ user: normalized });
            console.log('[auth:init] JWT 폴백으로 사용자 설정:', normalized);
          }
        } catch {}
      }
      
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
      
      // 토큰 저장
      setAuthToken(accessToken);
      if (refreshToken) setRefreshToken(refreshToken);

      // 서버의 내 정보로 {userId,name} 강제 동기화 (공백 정규화 포함)
      try {
        const me = await apiClient.get('/auth/me');
        const fetchedRaw = {
          userId: me.data?.data?.userId ?? me.data?.userId ?? userId,
          name: me.data?.data?.name ?? me.data?.name ?? name ?? userId,
        } as { userId: string; name: string };
        const uid = String(fetchedRaw.userId || '').trim();
        const nm = String(fetchedRaw.name || '').trim() || uid;
        const fetched = uid ? { userId: uid, name: nm } : null;
        if (fetched) {
          setUserInfo(fetched);
          set({ token: accessToken, user: fetched, isLoading: false });
        } else {
          set({ token: accessToken, user: null, isLoading: false });
        }
        try {
          const decoded = JSON.parse(atob(accessToken.split('.')[1] || ''));
          console.log('[auth:login] JWT payload:', decoded);
        } catch {}
        console.log('[auth:login] ui_user 저장:', fetched);
      } catch (e: any) {
        console.error('[auth:login] /auth/me 실패, 폴백 적용:', e?.response?.status, e?.response?.data?.message || e?.message);
        const uid = String(userId || '').trim();
        const nm = String(name || '').trim() || uid;
        const fallback = uid ? { userId: uid, name: nm } : null;
        if (fallback) {
          setUserInfo(fallback);
          set({ token: accessToken, user: fallback, isLoading: false });
        } else {
          set({ token: accessToken, user: null, isLoading: false });
        }
      }
      
          // 토큰 갱신 스케줄러는 일시적으로 비활성화
          // const scheduler = startTokenRefreshScheduler();
          // set({ refreshScheduler: scheduler });
      
      toast.success('로그인 성공!');
    } catch (error: any) {
      set({ isLoading: false });
      
      const errorMessage = error.response?.data?.message || '로그인에 실패했습니다.';
      toast.error((t) => (
        typeof window === 'undefined'
          ? errorMessage
          : (
            // 커스텀 닫기 버튼 포함 토스트 컨텐츠
            (() => {
              const React = require('react');
              const { createElement: h } = React;
              const onClose = () => {
                try { (require('react-hot-toast') as any).toast.dismiss(t.id); } catch {}
              };
              return h('div', { className: 'flex items-start gap-3' },
                h('div', { className: 'flex-1' }, errorMessage),
                h('button', {
                  onClick: onClose,
                  className: 'ml-4 px-2 py-1 text-sm rounded bg-white/10 hover:bg-white/20',
                }, '닫기')
              );
            })()
          )
      ), { duration: 10000 });
      
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

