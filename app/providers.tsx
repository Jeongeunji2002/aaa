'use client';

import { useEffect } from 'react';
import { enableUserInfoDebugTracer } from '@/lib/utils/cookie';

export default function ClientBootstraps() {
  useEffect(() => {
    try {
      enableUserInfoDebugTracer();
    } catch {}
  }, []);
  return null;
}


