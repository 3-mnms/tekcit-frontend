// src/shared/config/kakao.d.ts

declare namespace kakao {
  namespace maps {
    class LatLng {
      constructor(lat: number, lng: number)
      getLat(): number
      getLng(): number
    }

    interface MapOptions {
      center: LatLng
      level?: number
      draggable?: boolean
      scrollwheel?: boolean
      disableDoubleClickZoom?: boolean
      [key: string]: unknown
    }

     interface Map {
      setBounds(
        bounds: LatLngBounds,
        paddingTop?: number,
        paddingRight?: number,
        paddingBottom?: number,
        paddingLeft?: number
      ): void
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

    class LatLngBounds {
      constructor(sw?: LatLng, ne?: LatLng)
      extend(latlng: LatLng): void
      isEmpty(): boolean
    }
    class Size { constructor(width: number, height: number) }
    class MarkerImage { constructor(src: string, size: Size) }

    namespace event {
      function addListener(target: object, type: string, handler: (...args: unknown[]) => void): void
    }

    namespace services {
      const Status: {
        readonly OK: 'OK'
        readonly ZERO_RESULT: 'ZERO_RESULT'
        readonly ERROR: 'ERROR'
      }

      type ServiceStatus = typeof Status[keyof typeof Status]

      interface AddressSearchResult {
        address_name: string
        x: string   // lng
        y: string   // lat
        road_address_name?: string
        [key: string]: unknown
      }

      /* 장소 검색 결과 최소 필드 */
      interface PlacesSearchResult {
        id: string
        place_name: string
        address_name: string
        road_address_name?: string
        x: string   // lng
        y: string   // lat
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

type KakaoNamespace = typeof kakao
declare global {
  interface Window {
    kakao?: KakaoNamespace
  }
}

declare module '*.css'
declare module 'swiper/css'
declare module 'swiper/css/navigation'
declare module 'swiper/css/effect-coverflow'
