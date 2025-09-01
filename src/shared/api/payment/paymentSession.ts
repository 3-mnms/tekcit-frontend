export type BookingSession = {
  paymentId: string
  bookingId: string
  festivalId: string
  sellerId: number
  amount: number
  createdAt: number
}

const KEY = 'booking:session'

/** 주석: 세션 저장 */
export function saveBookingSession(s: BookingSession) {
  sessionStorage.setItem(KEY, JSON.stringify(s))
}

/** 주석: 세션 로드 */
export function loadBookingSession(): BookingSession | null {
  const raw = sessionStorage.getItem(KEY)
  return raw ? (JSON.parse(raw) as BookingSession) : null
}

/** 주석: 세션 삭제 */
export function clearBookingSession() {
  sessionStorage.removeItem(KEY)
}
