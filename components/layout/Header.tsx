'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Header() {
  const router = useRouter();
  const { user, logout, initialize, isInitialized } = useAuthStore();
  
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);
  
  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* 로고/제목 */}
          <Link 
            href={user ? '/boards' : '/'}
            className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition flex items-center space-x-2"
          >
            <span className="text-3xl">💜</span>
            <span>정은지</span>
          </Link>
          
          {/* 네비게이션 */}
          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                {/* 로그인 상태 */}
                <div className="flex items-center space-x-4">
                  <Link 
                    href="/boards"
                    className="text-gray-700 hover:text-blue-600 font-medium transition"
                  >
                    게시판
                  </Link>
                  
                  <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
                    {(() => {
                      const displayName = (user?.name || user?.userId || '').trim();
                      const displayId = (user?.userId || '').trim();
                      if (!displayName) {
                        return null; // 이름/아이디 없으면 표시하지 않음
                      }
                      return (
                        <>
                          <span className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-800">{displayName}</span>님
                          </span>
                          {displayId && displayId !== displayName && (
                            <span className="text-xs text-gray-500">({displayId})</span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition duration-200"
                  >
                    로그아웃
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* 비로그인 상태 */}
                <Link 
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  로그인
                </Link>
                <Link 
                  href="/signup"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition duration-200"
                >
                  회원가입
                </Link>
              </>
            )}
          </nav>
        </div>
        
        {/* 모바일용 사용자 정보 */}
          {user && (
          <div className="sm:hidden mt-3 px-4 py-2 bg-gray-100 rounded-lg text-center">
            {(() => {
              const displayName = (user?.name || user?.userId || '').trim();
              const displayId = (user?.userId || '').trim();
              if (!displayName) return null;
              return (
                <>
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-800">{displayName}</span>님
                  </span>
                  {displayId && displayId !== displayName && (
                    <span className="text-xs text-gray-500 ml-1">({displayId})</span>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </header>
  );
}

