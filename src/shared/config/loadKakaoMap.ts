// src/shared/config/loadKakaoMap.ts
function buildSdkUrl(appkey: string, bust?: string): string {
  const base = 'https://dapi.kakao.com/v2/maps/sdk.js'
  const qs = new URLSearchParams({ appkey, autoload: 'false', libraries: 'services' })
  if (bust) qs.set('_', bust)
  return `${base}?${qs.toString()}`
}

function appendScript(src: string): Promise<HTMLScriptElement> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-kakao-sdk="true"]')
    if (existing) {
      if (existing.dataset.loaded === 'true') return resolve(existing)
      existing.addEventListener('load', () => resolve(existing))
      existing.addEventListener('error', () => reject(new Error('SCRIPT_TAG_LOAD_ERROR')))
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.defer = true
    s.dataset.kakaoSdk = 'true'
    s.onload = () => { s.dataset.loaded = 'true'; resolve(s) }
    s.onerror = () => reject(new Error('SCRIPT_TAG_LOAD_ERROR'))
    document.head.appendChild(s)
  })
}

let kakaoReadyPromise: Promise<typeof kakao> | null = null

export async function loadKakaoMapSdk(): Promise<typeof kakao> {
  if (typeof window === 'undefined') throw new Error('WINDOW_UNDEFINED')
  if (window.kakao?.maps) return window.kakao as typeof kakao
  if (kakaoReadyPromise) return kakaoReadyPromise

  kakaoReadyPromise = (async () => {
    const appkey = import.meta.env.VITE_KAKAO_MAP_APP_KEY as string | undefined
    if (!appkey) throw new Error('VITE_KAKAO_MAP_APP_KEY_MISSING')

    const url = buildSdkUrl(appkey)
    try {
      await appendScript(url)
    } catch {
      await appendScript(buildSdkUrl(appkey, String(Date.now())))
    }

    const ns = window.kakao
    if (!ns?.maps?.load) throw new Error('KAKAO_GLOBAL_MISSING_POSSIBLE_DOMAIN_MISMATCH')

    return await new Promise<typeof kakao>((resolve) => {
      ns.maps.load(() => resolve(ns as typeof kakao))
    })
  })()

  return kakaoReadyPromise
}
