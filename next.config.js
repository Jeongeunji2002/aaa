/** @type {import('next').NextConfig} */
const nextConfig = async () => {
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  let destOrigin = 'http://localhost:3001';
  try {
    const u = new URL(api);
    destOrigin = `${u.protocol}//${u.hostname}${u.port ? `:${u.port}` : ''}`;
    // 개발 브라우저 → 프론트(8080) 서버에서 프록시가 처리하므로 도커 내부 호스트명 사용 가능
  } catch {}

  return {
    async rewrites() {
      return [
        {
          source: '/uploads/:path*',
          destination: `${destOrigin}/uploads/:path*`,
        },
      ];
    },
  };
};

module.exports = nextConfig;


