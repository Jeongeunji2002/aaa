'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import SocialLoginButtons from './SocialLoginButtons';

// 회원가입 폼 스키마
const signupSchema = z.object({
  userId: z
    .string()
    .min(4, '아이디는 최소 4자 이상이어야 합니다.')
    .max(20, '아이디는 최대 20자까지 가능합니다.')
    .regex(/^[a-zA-Z0-9_]+$/, '아이디는 영문, 숫자, 언더스코어만 사용 가능합니다.'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .max(50, '비밀번호는 최대 50자까지 가능합니다.'),
  passwordConfirm: z.string(),
  name: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다.')
    .max(20, '이름은 최대 20자까지 가능합니다.'),
  email: z.string().email('올바른 이메일 형식이 아닙니다.').optional().or(z.literal('')),
}).refine((data) => data.password === data.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['passwordConfirm'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });
  
  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsSubmitting(true);
      
      const { passwordConfirm, ...signupData } = data;
      
      await signup({
        ...signupData,
        email: signupData.email || undefined,
      });
      
      // 회원가입 성공 시 로그인 페이지로 이동
      router.push('/login');
    } catch (error) {
      // 에러는 authStore에서 처리됨
      console.error('Signup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          회원가입
        </h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 아이디 */}
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
              아이디 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('userId')}
              type="text"
              id="userId"
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
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="비밀번호를 입력하세요"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          
          {/* 비밀번호 확인 */}
          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 확인 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('passwordConfirm')}
              type="password"
              id="passwordConfirm"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="비밀번호를 다시 입력하세요"
            />
            {errors.passwordConfirm && (
              <p className="mt-1 text-sm text-red-600">{errors.passwordConfirm.message}</p>
            )}
          </div>
          
          {/* 이름 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="이름을 입력하세요"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          
          {/* 이메일 (선택) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="이메일을 입력하세요 (선택)"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          
          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 mt-6"
          >
            {isSubmitting ? '가입 중...' : '회원가입'}
          </button>
        </form>
        
        {/* 로그인 링크 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link 
              href="/login" 
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
      
      {/* 소셜 로그인 */}
      <div className="w-full max-w-md mx-auto px-6 mt-6">
        <SocialLoginButtons />
      </div>
    </div>
  );
}

