'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/src/FRONTEND/LIB/STORE/authStore';
import Link from 'next/link';

// 로그인 폼 스키마
const loginSchema = z.object({
  userId: z.string().min(1, '아이디를 입력하세요.'),
  password: z.string().min(1, '비밀번호를 입력하세요.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  
  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      
      await login(data);
      
      // 로그인 성공 시 게시판 목록 페이지로 이동
      router.push('/boards');
    } catch (error) {
      // 에러는 authStore에서 처리됨
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          로그인
        </h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 아이디 */}
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
              아이디
            </label>
            <input
              {...register('userId')}
              type="text"
              id="userId"
              autoComplete="username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="아이디를 입력하세요"
            />
            {errors.userId && (
              <p className="mt-1 text-sm text-red-600">{errors.userId.message}</p>
            )}
          </div>
          
          {/* 비밀번호 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              autoComplete="current-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="비밀번호를 입력하세요"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          
          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 mt-6"
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>
        
        {/* 회원가입 링크 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link 
              href="/signup" 
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

