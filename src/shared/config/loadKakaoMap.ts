// src/shared/config/loadKakaoMap.ts

type KakaoMaps = {
  load: (cb: () => void) => void;
  // 필요한 생성자/타입을 점진적으로 추가하세요 (예: Map, LatLng 등)
  // Map?: new (container: HTMLElement, options: Record<string, unknown>) => unknown;
  // LatLng?: new (lat: number, lng: number) => unknown;
  // services?: unknown;
};

export type KakaoGlobal = {
  maps: KakaoMaps;
};

declare global {
  interface Window {
    kakao?: KakaoGlobal;
  }
}

let kakaoReadyPromise: Promise<KakaoGlobal> | null = null;

function buildSdkUrl(appkey: string, bust?: string): string {
  const base = 'https://dapi.kakao.com/v2/maps/sdk.js';
  const qs = new URLSearchParams({
    appkey,
    autoload: 'false',
    libraries: 'services',
  });
  if (bust) qs.set('_', bust);
  return `${base}?${qs.toString()}`;
}

function appendScript(src: string): Promise<HTMLScriptElement> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-kakao-sdk="true"]');
    if (existing) {
      if (existing.dataset.loaded === 'true') return resolve(existing);
      existing.addEventListener('load', () => resolve(existing));
      existing.addEventListener('error', () => reject(new Error('SCRIPT_TAG_LOAD_ERROR')));
      return;
    }

    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.defer = true;
    s.dataset.kakaoSdk = 'true';
    s.onload = () => {
      s.dataset.loaded = 'true';
      resolve(s);
    };
    s.onerror = () => reject(new Error('SCRIPT_TAG_LOAD_ERROR'));
    document.head.appendChild(s);
  });
}

export async function loadKakaoMapSdk(): Promise<KakaoGlobal> {
  if (typeof window === 'undefined') throw new Error('WINDOW_UNDEFINED');
  if (window.kakao?.maps) return window.kakao;

  if (kakaoReadyPromise) return kakaoReadyPromise;

  kakaoReadyPromise = (async () => {
    const appkey = import.meta.env.VITE_KAKAO_MAP_APP_KEY as string | undefined;
    if (!appkey) throw new Error('VITE_KAKAO_MAP_APP_KEY_MISSING');

    const url = buildSdkUrl(appkey);

    try {
      const res = await fetch(url, { method: 'GET', mode: 'cors', cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error(`KAKAO_AUTH_ERROR_${res.status}: JavaScript 키 또는 도메인 설정 확인 필요`);
        }
        throw new Error(`KAKAO_FETCH_ERROR_${res.status}`);
      }
    } catch {
      // 네트워크/확장프로그램/CORS 등으로 실패 가능 — 실제 로드는 계속 시도
      // console.warn('[KakaoMap] prefetch failed:', e);
    }

    try {
      await appendScript(url);
    } catch {
      await appendScript(buildSdkUrl(appkey, String(Date.now())));
    }

    const kakao = window.kakao;
    if (!kakao?.maps?.load) {
      throw new Error('KAKAO_GLOBAL_MISSING_POSSIBLE_DOMAIN_MISMATCH');
    }

    return await new Promise<KakaoGlobal>((resolve) => {
      kakao.maps.load(() => resolve(kakao));
    });
  })();

  return kakaoReadyPromise;
}
