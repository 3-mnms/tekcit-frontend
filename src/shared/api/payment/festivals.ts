import { api } from '@/shared/config/axios'

/** ✅ 서버 공통 래퍼(주소록 예시와 동일 패턴) 멍 */
type SuccessResponse<T> = {
  data: T
  message?: string
}

/** ✅ 서버 실제 응답 DTO(네가 준 자바 DTO에 맞춤) 멍 */
export type FestivalRegisterResponseDTO = {
  fid: string                 // 공연 ID
  fname: string               // 공연명
  fdfrom: string              // 시작일(yyyy-MM-dd)
  fdto: string                // 종료일(yyyy-MM-dd)
  posterFile?: string         // 포스터 URL
  fcltynm?: string            // 공연장 이름
  genrenm?: string            // 장르명
  detail?: FestivalDetailDTO  // 상세 정보(중첩)
  schedules?: FestivalScheduleDTO[] // 일정 리스트(중첩)
}

/** ✅ 내부 중첩 DTO들(자바 내부 클래스에 맞춤) 멍 */
export type FestivalDetailDTO = {
  fcltyid?: string
  fcast?: string
  story?: string
  ticketPrice?: number
  faddress?: string
  ticketPick?: number         // 1: 현장, 2: 배송, 3: 둘다
  maxPurchase?: number
  prfage?: string
  availableNOP?: number
  contentFile?: string[]
  updatedate?: string         // "yyyy-MM-dd HH:mm:ss"
  entrpsnmH?: string
  runningTime?: string
}

export type FestivalScheduleDTO = {
  dayOfWeek: string           // "MON" | "TUE" ...
  time: string                // "19:00"
}

/** ✅ 프론트 표시용 DTO(안전 기본값/라벨 포함) 멍 */
export type FestivalDetailViewDTO = {
  fid: string
  title: string               // 화면 제목
  periodLabel: string         // "YYYY-MM-DD ~ YYYY-MM-DD" / "일시 미표기"
  posterUrl?: string
  venue?: string              // 공연장명
  genre?: string              // 장르명
  schedulesText?: string      // "MON 19:00 · WED 14:00" 형태의 요약
  detail?: FestivalDetailDTO  // 그대로 노출(필요한 곳에서 세부 접근)
  raw: FestivalRegisterResponseDTO // 원본도 보관(디버깅/추가필드용)
}

/** ✅ 서버→프론트 매핑: 키/라벨 정리 멍 */
function mapToView(raw: FestivalRegisterResponseDTO): FestivalDetailViewDTO {
  // 제목: fname 없을 경우 fid로 대체 멍
  const title = raw.fname || `공연 #${raw.fid}`

  // 기간 라벨: fdfrom/fdto 조합 멍
  let periodLabel = '일시 미표기'
  if (raw.fdfrom && raw.fdto) periodLabel = `${raw.fdfrom} ~ ${raw.fdto}`
  else if (raw.fdfrom) periodLabel = raw.fdfrom
  else if (raw.fdto) periodLabel = raw.fdto

  // 일정 요약 문자열 멍
  const schedulesText = (raw.schedules?.length ?? 0) > 0
    ? raw.schedules!.map(s => `${s.dayOfWeek} ${s.time}`).join(' · ')
    : undefined

  return {
    fid: raw.fid,
    title,
    periodLabel,
    posterUrl: raw.posterFile,   // 🔑 서버 키가 posterFile
    venue: raw.fcltynm,
    genre: raw.genrenm,
    schedulesText,
    detail: raw.detail,
    raw,
  }
}

/** 🔹 상세 조회(조회 전용): GET /festival/{fid} 멍
 *  - 공통 api가 baseURL('/api'), 토큰/재발급까지 처리
 *  - 주소록 예시처럼 res.data.data에서 언랩
 */
export const getFestivalDetail = async (fid: string | number): Promise<FestivalDetailViewDTO> => {
  const res = await api.get<SuccessResponse<FestivalRegisterResponseDTO>>(`/festival/${fid}`)
  return mapToView(res.data.data)
}

/** (옵션) 원본 그대로 필요하면 이 함수도 제공 멍 */
export const getFestivalDetailRaw = async (fid: string | number): Promise<FestivalRegisterResponseDTO> => {
  const res = await api.get<SuccessResponse<FestivalRegisterResponseDTO>>(`/festival/${fid}`)
  return res.data.data
}
