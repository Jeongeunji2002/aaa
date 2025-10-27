// Axios 인스턴스 및 인터셉터 설정

import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { getAuthToken } from '@/src/FRONTEND/LIB/UTILS/cookie';
import { getCsrfHeader } from '@/src/FRONTEND/LIB/UTILS/csrf';
import { refreshAccessToken } from '@/src/FRONTEND/LIB/UTILS/tokenRefresh';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 전송 허용
});

// Request 인터셉터: 모든 요청에 JWT 토큰 및 CSRF 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    // JWT 토큰 추가 (쿠키에서 가져오기)
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // CSRF 토큰 추가 (GET 요청 제외)
    if (config.method !== 'get' && config.headers) {
      const csrfHeaders = getCsrfHeader();
      Object.assign(config.headers, csrfHeaders);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response 인터셉터: 에러 핸들링 및 토큰 갱신
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as any;
    
    switch (status) {
      case 401:
        // Unauthorized - 토큰 만료 또는 유효하지 않음
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          
          // 토큰 갱신 시도
          const refreshSuccess = await refreshAccessToken();
          
          if (refreshSuccess) {
            // 갱신 성공 시 원래 요청 재시도
            return apiClient(originalRequest);
          }
        }
        
        // 갱신 실패 또는 재시도 완료 후에도 실패
        toast.error('인증이 만료되었습니다. 다시 로그인해주세요.');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        break;
        
      case 403:
        // Forbidden - 권한 없음 또는 CSRF 토큰 오류
        const errorData = error.response?.data as any;
        if (errorData?.message?.includes('CSRF')) {
          toast.error('보안 토큰이 유효하지 않습니다. 페이지를 새로고침해주세요.');
          // CSRF 토큰 재생성
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        } else {
          toast.error('접근 권한이 없습니다.');
        }
        break;
        
      case 404:
        // Not Found
        toast.error('요청한 리소스를 찾을 수 없습니다.');
        break;
        
      case 429:
        // Too Many Requests - Rate Limiting
        toast.error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
        break;
        
      case 500:
        // Server Error
        toast.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        break;
        
      default:
        if (error.message === 'Network Error') {
          toast.error('네트워크 연결을 확인해주세요.');
        } else {
          toast.error('오류가 발생했습니다.');
        }
    }
    
    return Promise.reject(error);
  }
);

