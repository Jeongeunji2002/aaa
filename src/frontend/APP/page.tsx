import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 flex justify-center items-center space-x-4">
            <span className="text-7xl md:text-8xl">💜</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            정은지
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            소셜 로그인을 지원하는 현대적인 게시판 플랫폼
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-lg transition duration-200"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-blue-600 text-lg font-semibold rounded-lg shadow-lg transition duration-200"
            >
              회원가입
            </Link>
          </div>
          
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-blue-600 text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold mb-2">JWT 인증</h3>
              <p className="text-gray-600">
                안전한 JWT 토큰 기반 인증 시스템
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-blue-600 text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">게시판 CRUD</h3>
              <p className="text-gray-600">
                게시글 작성, 조회, 수정, 삭제 기능
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-blue-600 text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">반응형 디자인</h3>
              <p className="text-gray-600">
                모바일, 태블릿, 데스크톱 지원
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
