// src/shared/config/kakao.d.ts

declare namespace kakao {
  namespace maps {
    function load(callback: () => void): void;
    /* ---------- Core ---------- */
    class LatLng {
      constructor(lat: number, lng: number)
      getLat(): number
      getLng(): number
    }

    class LatLngBounds {
      constructor(sw?: LatLng, ne?: LatLng)
      extend(latlng: LatLng): void
      isEmpty(): boolean
    }

    class Size { constructor(width: number, height: number) }
    class MarkerImage { constructor(src: string, size: Size) }

    interface MapOptions {
      center: LatLng
      level?: number
      draggable?: boolean
      scrollwheel?: boolean
      disableDoubleClickZoom?: boolean
      [key: string]: unknown
    }

    /* ✅ 클래스(생성자 필요) */
    class Map {
      constructor(container: HTMLElement, options: MapOptions)
      setBounds(bounds: LatLngBounds, pt?: number, pr?: number, pb?: number, pl?: number): void
      setCenter(latlng: LatLng): void
      setLevel(level: number): void
      getLevel(): number
    }

    interface MarkerOptions {
      position: LatLng
      map?: Map | null
      title?: string
      clickable?: boolean
      draggable?: boolean
      zIndex?: number
      [key: string]: unknown
    }

    class Marker {
      constructor(options: MarkerOptions)
      setMap(map: Map | null): void
      getPosition(): LatLng
      setPosition(latlng: LatLng): void
    }

    class InfoWindow {
      constructor(options: { content: string | HTMLElement; removable?: boolean; zIndex?: number })
      open(map: Map, marker?: Marker): void
      close(): void
    }

    namespace event {
      function addListener(target: object, type: string, handler: (...args: unknown[]) => void): void
    }

    /* ---------- Services ---------- */
    namespace services {
      const Status: {
        readonly OK: 'OK'
        readonly ZERO_RESULT: 'ZERO_RESULT'
        readonly ERROR: 'ERROR'
      }

      type ServiceStatus = typeof Status[keyof typeof Status]

      interface AddressSearchResult {
        address_name: string
        x: string // lng
        y: string // lat
        road_address_name?: string
        [key: string]: unknown
      }

      interface PlacesSearchResult {
        id: string
        place_name: string
        address_name: string
        road_address_name?: string
        x: string // lng
        y: string // lat
        phone?: string
        place_url?: string
        [key: string]: unknown
      }

      interface SearchOptions {
        page?: number
        size?: number
        category_group_code?: string
        location?: LatLng
        radius?: number
        [key: string]: unknown
      }

      class Geocoder {
        addressSearch(
          query: string,
          callback: (result: AddressSearchResult[], status: ServiceStatus) => void,
          options?: SearchOptions
        ): void
      }

      class Places {
        keywordSearch(
          query: string,
          callback: (result: PlacesSearchResult[], status: ServiceStatus) => void,
          options?: SearchOptions
        ): void
      }
    }
  }
}

/* 전역 Window에 kakao 노출 */
type KakaoNamespace = typeof kakao
declare global {
  interface Window {
    kakao?: KakaoNamespace
  }
}

/* 스타일 모듈 선언 */
declare module '*.css'
declare module 'swiper/css'
declare module 'swiper/css/navigation'
declare module 'swiper/css/effect-coverflow'
