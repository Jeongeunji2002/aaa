'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { getBoardDetail, deleteBoard } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import { getCategoryLabel, formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { Board } from '@/types';
import Image from 'next/image';
import { toAssetUrl } from '@/lib/utils/url';

export default function BoardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
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
  
  const handleEdit = () => {
    router.push(`/boards/${boardId}/edit`);
  };
  
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!boardId) return;
    
    try {
      setIsDeleting(true);
      await deleteBoard(boardId);
      
      toast.success('게시글이 삭제되었습니다.');
      router.push('/boards');
    } catch (error: any) {
      console.error('Failed to delete board:', error);
      if (error.response?.status === 403) {
        toast.error('삭제 권한이 없습니다.');
      } else if (error.response?.status === 404) {
        toast.error('게시글을 찾을 수 없습니다.');
      } else {
        toast.error('게시글 삭제에 실패했습니다.');
      }
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };
  
  const handleBack = () => {
    router.push('/boards');
  };
  
  const categoryColors: Record<string, string> = {
    NOTICE: 'bg-red-100 text-red-800',
    FREE: 'bg-blue-100 text-blue-800',
    QNA: 'bg-green-100 text-green-800',
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
        {/* 뒤로가기 버튼 */}
        <button
          onClick={handleBack}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>목록으로</span>
        </button>
        
        {/* 게시글 상세 */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          {/* 헤더 */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex-1 pr-4">
                {board.title}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${categoryColors[board.category] || 'bg-gray-100 text-gray-800'}`}>
                {getCategoryLabel(board.category)}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <span>{formatDate(board.createdAt)}</span>
                {board.updatedAt !== board.createdAt && (
                  <span className="text-gray-400">(수정됨)</span>
                )}
              </div>
              <div className="text-right">
                <span>
                  작성자: <b>{board.author?.name || board.author?.userId || '작성자 미상'}</b>
                  {board.author?.userId && board.author?.name ? ` (${board.author.userId})` : ''}
                </span>
              </div>
            </div>
          </div>
          
          {/* 이미지 */}
          {board.imageUrl && (
            <div className="mb-6">
              <div className="relative w-full bg-gray-50 rounded-lg overflow-hidden" style={{ minHeight: '300px' }}>
                {/* skeleton */}
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100" />
                {/* image */}
                <img
                  src={toAssetUrl(board.imageUrl) || ''}
                  alt={board.title}
                  loading="lazy"
                  className="relative w-full h-auto rounded-lg"
                  onLoad={(e) => {
                    const sk = (e.target as HTMLImageElement).previousElementSibling as HTMLElement | null;
                    if (sk) sk.style.display = 'none';
                  }}
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = 'none';
                    const sk = el.previousElementSibling as HTMLElement | null;
                    if (sk) sk.className = 'absolute inset-0 bg-gray-100 flex items-center justify-center';
                  }}
                />
              </div>
            </div>
          )}
          
          {/* 내용 */}
          <div className="prose max-w-none mb-8">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {board.content}
            </p>
          </div>
          
          {/* 액션 버튼 (작성자 본인만 노출) */}
          {user && board.author && user.userId === board.author.userId && (
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={handleEdit}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition duration-200"
              >
                수정
              </button>
              <button
                onClick={handleDeleteClick}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition duration-200"
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">게시글 삭제</h3>
            <p className="text-gray-600 mb-6">
              정말로 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition duration-200 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition duration-200 disabled:opacity-50"
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

