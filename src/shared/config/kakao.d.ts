// src/shared/config/kakao.d.ts
declare global {
  interface Window { kakao: any }
}

declare namespace kakao {
  namespace maps {
    class LatLng { constructor(lat: number, lng: number) }
    class Map {
      constructor(container: HTMLElement, options: any)
      relayout(): void
      setCenter(latlng: LatLng): void
    }
    class Marker {
      constructor(options: any)
      setMap(map: Map | null): void
      getPosition(): LatLng
    }
    namespace services {
      const Status: { OK: string }
      class Geocoder {
        addressSearch(q: string, cb: (res: any[], status: string) => void): void
      }
      class Places {
        keywordSearch(q: string, cb: (res: any[], status: string) => void): void
      }
    }
  }
}

declare module '*.css';
declare module 'swiper/css';
declare module 'swiper/css/navigation';
declare module 'swiper/css/effect-coverflow';