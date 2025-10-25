'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { socialLogin } from '@/lib/api/social.api';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { SocialProvider } from '@/types/social.types';

export default function SocialCallbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const provider = params.provider as SocialProvider;
  
  useEffect(() => {
    handleCallback();
  }, []);
  
  const handleCallback = async () => {
    try {
      // URL에서 code와 state 파라미터 가져오기
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');
      
      // 에러 파라미터가 있으면 사용자가 취소한 것
      if (errorParam) {
        toast.error('소셜 로그인이 취소되었습니다.');
        router.push('/login');
        return;
      }
      
      // code가 없으면 에러
      if (!code) {
        throw new Error('인증 코드를 받지 못했습니다.');
      }
      
      // state 검증 (CSRF 방지)
      const savedState = localStorage.getItem(`oauth_state_${provider}`);
      if (savedState && state !== savedState) {
        throw new Error('잘못된 요청입니다. (State mismatch)');
      }
      
      // localStorage에서 state 제거
      localStorage.removeItem(`oauth_state_${provider}`);
      
      // 백엔드 API로 code 전송하여 토큰 받기
      const response = await socialLogin({
        provider,
        code,
        state: state || undefined,
      });
      
      // 토큰 및 사용자 정보 저장
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('user', JSON.stringify({
        userId: response.userId,
        name: response.name,
      }));
      
      // Zustand 스토어 초기화
      useAuthStore.getState().initialize();
      
      toast.success(`${provider} 로그인 성공!`);
      router.push('/boards');
      
    } catch (error: any) {
      console.error('Social login callback error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          '소셜 로그인에 실패했습니다.';
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {isProcessing ? (
            <>
              <LoadingSpinner size="lg" />
              <h2 className="mt-6 text-xl font-semibold text-gray-800">
                소셜 로그인 처리 중...
              </h2>
              <p className="mt-2 text-gray-600">
                잠시만 기다려주세요.
              </p>
            </>
          ) : error ? (
            <>
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-800">
                로그인 실패
              </h2>
              <p className="mt-2 text-gray-600">
                {error}
              </p>
              <p className="mt-4 text-sm text-gray-500">
                로그인 페이지로 이동합니다...
              </p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

