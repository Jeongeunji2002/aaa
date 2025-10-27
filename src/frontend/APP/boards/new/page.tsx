'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { createBoard } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import BoardForm from '@/components/boards/BoardForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { CreateBoardData } from '@/types';

export default function NewBoardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (
    data: CreateBoardData,
    file: File | null
  ) => {
    try {
      setIsSubmitting(true);
      
      const board = await createBoard(data, file || undefined);
      
      toast.success('게시글이 작성되었습니다.');
      router.push(`/boards/${board.id}`);
    } catch (error: any) {
      console.error('Failed to create board:', error);
      
      if (error.response?.status !== 401) {
        toast.error('게시글 작성에 실패했습니다.');
      }
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    router.push('/boards');
  };
  
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">게시글 작성</h1>
          <p className="text-gray-600">새로운 게시글을 작성합니다.</p>
        </div>
        
        {/* 폼 */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <BoardForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="작성하기"
          />
          
          {/* 취소 버튼 */}
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="w-full mt-3 px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 rounded-lg font-semibold transition duration-200"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

