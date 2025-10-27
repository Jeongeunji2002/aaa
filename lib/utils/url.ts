export const getBackendOrigin = (): string => {
  const api = process.env.NEXT_PUBLIC_API_URL || '';
  try {
    const u = new URL(api);
    // if api ends with /api, strip path
    let origin = `${u.protocol}//${u.hostname}${u.port ? `:${u.port}` : ''}`;
    if (typeof window !== 'undefined') {
      // 개발 브라우저에서 backend 호스트는 접근 불가 → localhost 대체
      if (u.hostname === 'backend') {
        origin = `${u.protocol}//localhost${u.port ? `:${u.port}` : ''}`;
      }
    }
    return origin;
  } catch {
    // 환경변수 미설정 시 프론트 dev 서버에서 백엔드가 3001이라 가정
    return typeof window !== 'undefined' ? `${window.location.protocol}//localhost:3001` : 'http://localhost:3001';
  }
};

export const toAssetUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const origin = getBackendOrigin();
  if (path.startsWith('/')) return `${origin}${path}`;
  return `${origin}/${path}`;
};


