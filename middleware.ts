// 보안 헤더 및 미들웨어 설정

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // 보안 헤더 설정
  const securityHeaders = {
    // DNS Prefetching 허용
    'X-DNS-Prefetch-Control': 'on',
    
    // HTTPS 강제 (프로덕션)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // Clickjacking 방지
    'X-Frame-Options': 'SAMEORIGIN',
    
    // MIME 타입 스니핑 방지
    'X-Content-Type-Options': 'nosniff',
    
    // XSS 필터 활성화 (레거시 브라우저용)
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer 정책
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // 권한 정책
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  };
  
  // 헤더 적용
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// 미들웨어 적용 경로 설정
export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 경로에 적용:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

