// src/shared/hooks/usePreload.ts
import { useEffect } from 'react';

export function usePreloadImage(src?: string) {
  useEffect(() => {
    if (!src) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    (link as any).fetchPriority = 'high'; // 지원 브라우저에서 우선순위↑
    link.href = src;

    document.head.appendChild(link);
    return () => {
      try { document.head.removeChild(link); } catch {}
    };
  }, [src]);
}
