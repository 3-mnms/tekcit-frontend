// src/shared/config/loadKakaoMap.ts
let kakaoReadyPromise: Promise<any> | null = null;

function buildSdkUrl(appkey: string, bust?: string) {
  const base = 'https://dapi.kakao.com/v2/maps/sdk.js';
  const qs = new URLSearchParams({
    appkey,
    autoload: 'false',
    libraries: 'services',
  });
  if (bust) qs.set('_', bust);
  return `${base}?${qs.toString()}`;
}

function appendScript(src: string) {
  return new Promise<HTMLScriptElement>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.defer = true;
    s.dataset.kakaoSdk = 'true';
    s.onload = () => resolve(s);
    s.onerror = () => reject(new Error('SCRIPT_TAG_LOAD_ERROR'));
    document.head.appendChild(s);
  });
}

export async function loadKakaoMapSdk(): Promise<any> {
  if (typeof window === 'undefined') throw new Error('WINDOW_UNDEFINED');
  if ((window as any).kakao?.maps) return (window as any).kakao;
  if (kakaoReadyPromise) return kakaoReadyPromise;

  kakaoReadyPromise = (async () => {
    const appkey = import.meta.env.VITE_KAKAO_MAP_APP_KEY as string | undefined;
    if (!appkey) throw new Error('VITE_KAKAO_MAP_APP_KEY_MISSING');

    const url = buildSdkUrl(appkey);

    // 1) 사전 상태 점검 (가능하면 status 파악)
    try {
      const res = await fetch(url, { method: 'GET', mode: 'cors', cache: 'no-store' });
      if (!res.ok) {
        // 401/403 → 거의 100% “키/도메인” 문제
        if (res.status === 401 || res.status === 403) {
          throw new Error(`KAKAO_AUTH_ERROR_${res.status}: JavaScript 키/도메인 불일치 가능성 높음`);
        }
        throw new Error(`KAKAO_FETCH_ERROR_${res.status}`);
      }
    } catch (e: any) {
      // CORS 차단/네트워크/확장프로그램
      console.warn('[KakaoMap] prefetch failed:', e?.message || e);
      // 그래도 한 번은 로드 시도
    }

    // 2) 스크립트 로드 (실패 시 캐시버스터로 1회 재시도)
    try {
      await appendScript(url);
    } catch {
      await appendScript(buildSdkUrl(appkey, String(Date.now())));
    }

    if (!(window as any).kakao?.maps?.load) {
      // 스크립트는 받았는데 전역이 비어있음 → 보통 도메인/키 문제
      throw new Error('KAKAO_GLOBAL_MISSING_POSSIBLE_DOMAIN_MISMATCH');
    }

    return await new Promise((resolve) => {
      (window as any).kakao.maps.load(() => resolve((window as any).kakao));
    });
  })();

  return kakaoReadyPromise;
}
