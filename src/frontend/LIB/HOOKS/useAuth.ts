'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/FRONTEND/LIB/STORE/authStore';

// 인증이 필요한 페이지에서 사용하는 커스텀 훅
export function useAuth() {
  const router = useRouter();
  const { user, initialize, isInitialized } = useAuthStore();
  
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);
  
  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login');
    }
  }, [isInitialized, user, router]);
  
  return { user, isLoading: !isInitialized };
}

