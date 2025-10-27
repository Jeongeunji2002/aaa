'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { getBoardDetail, updateBoard } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import BoardForm from '@/components/boards/BoardForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { Board, UpdateBoardData } from '@/types';

export default function EditBoardPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const boardId = typeof params.id === 'string' ? parseInt(params.id) : null;
  
  useEffect(() => {
    if (user && boardId) {
      fetchBoard();
    }
  }, [user, boardId]);
  
  const fetchBoard = async () => {
    if (!boardId) return;
    
    try {
      setIsLoading(true);
      const data = await getBoardDetail(boardId);
      setBoard(data);
    } catch (error: any) {
      console.error('Failed to fetch board:', error);
      
      if (error.response?.status === 404) {
        toast.error('게시글을 찾을 수 없습니다.');
      } else if (error.response?.status !== 401) {
        toast.error('게시글을 불러오는데 실패했습니다.');
      }
      
      router.push('/boards');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (
    data: UpdateBoardData,
    file: File | null
  ) => {
    if (!boardId) return;
    
    try {
      setIsSubmitting(true);
      
      const updatedBoard = await updateBoard(boardId, data, file || undefined);
      
      toast.success('게시글이 수정되었습니다.');
      router.push(`/boards/${updatedBoard.id}`);
    } catch (error: any) {
      console.error('Failed to update board:', error);
      
      if (error.response?.status !== 401) {
        toast.error('게시글 수정에 실패했습니다.');
      }
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    router.push(`/boards/${boardId}`);
  };
  
  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!board) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">게시글 수정</h1>
          <p className="text-gray-600">게시글 내용을 수정합니다.</p>
        </div>
        
        {/* 폼 */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <BoardForm
            initialData={{
              title: board.title,
              content: board.content,
              category: board.category,
              imageUrl: board.imageUrl,
            }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="수정하기"
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

