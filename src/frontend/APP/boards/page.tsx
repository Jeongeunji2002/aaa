'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { getBoardList } from '@/src/FRONTEND/LIB/API';
import { useAuth } from '@/src/FRONTEND/LIB/HOOKS/useAuth';
import BoardCard from '@/src/FRONTEND/SECTION/BODY/BOARD/BoardCard';
import Pagination from '@/src/FRONTEND/SECTION/BODY/BOARD/Pagination';
import LoadingSpinner from '@/src/FRONTEND/SECTION/BODY/COMMON/LoadingSpinner';
import EmptyState from '@/src/FRONTEND/SECTION/BODY/COMMON/EmptyState';
import type { Board } from '@/src/FRONTEND/LIB/TYPES';

export default function BoardsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchBoards(currentPage);
    }
  }, [currentPage, user]);
  
  const fetchBoards = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await getBoardList(page, 10);
      
      setBoards(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error: any) {
      console.error('Failed to fetch boards:', error);
      
      if (error.response?.status !== 401) {
        toast.error('게시글을 불러오는데 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCreatePost = () => {
    router.push('/boards/new');
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
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">게시판</h1>
            <p className="text-gray-600">전체 {totalElements}개의 게시글</p>
          </div>
          <button
            onClick={handleCreatePost}
            className="mt-4 sm:mt-0 w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg transition duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>글쓰기</span>
          </button>
        </div>
        
        {/* 로딩 상태 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* 게시글 목록 */}
            {boards.length > 0 ? (
              <>
                <div className="grid gap-4 md:gap-6">
                  {boards.map((board) => (
                    <BoardCard key={board.id} board={board} />
                  ))}
                </div>
                
                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            ) : (
              <EmptyState
                title="게시글이 없습니다"
                description="첫 번째 게시글을 작성해보세요!"
                action={{
                  label: '글쓰기',
                  onClick: handleCreatePost,
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

