import styles from './BookingProductInfo.module.css' // CSS 모듈 임포트 멍
import { bookingProduct } from '@models/payment/bookingProduct' // 더미/실데이터 임포트 멍

// 숫자/문자 섞여 올 수 있는 price를 안전하게 숫자로 변환하는 헬퍼 멍
const toNumber = (v: unknown): number => {
  // v가 숫자면 그대로 쓰기 멍
  if (typeof v === 'number') return v // 숫자면 바로 반환 멍
  // 문자열 등에서 숫자만 추출해 정수로 변환 멍
  const n = parseInt(String(v ?? '').replace(/[^0-9]/g, ''), 10) // 숫자만 남기고 파싱 멍
  return Number.isFinite(n) ? n : 0 // NaN 방지 멍
}

// KRW 통화 표기(157,000원) 포맷터 멍
const formatKRW = (n: number) => `${n.toLocaleString('ko-KR')}원` // 3자리 콤마 + 원 멍

const BookingProductInfo: React.FC = () => {
  // 가격 숫자 계산 멍
  const priceNumber = toNumber(bookingProduct.price) // price를 정수로 변환 멍
  // 표시용 문자열 생성 멍
  const priceDisplay = formatKRW(priceNumber) // 157,000원 형태로 변환 멍

  return (
    // 섹션 루트 래퍼 멍
    <section className={styles.productSection}>
      {/* 카드 컨테이너 멍 */}
      <div className={styles.card}>
        {/* 좌측: 포스터(옵션) + 기본 정보 멍 */}
        <div className={styles.left}>
          {/* 포스터가 없으면 플레이스홀더 배경 멍 */}
          <div className={styles.poster} aria-hidden /> 
          <div className={styles.info}>
            {/* 공연명 멍 */}
            <h3 className={styles.title}>{bookingProduct.title}</h3>
            {/* 일시/장소 멍 */}
            <p className={styles.meta}>
              <span className={styles.metaItem}>{bookingProduct.datetime}</span>{' '}{/* 일시 멍 */}
              <span className={styles.dot} aria-hidden>·</span>{' '}{/* 구분점 멍 */}
              <span className={styles.metaItem}>{bookingProduct.location}</span>{/* 장소 멍 */}
            </p>
            {/* 라벨-값 2열 그리드 정보 멍 */}
            <dl className={styles.kvGrid}>
              <div className={styles.kvRow}>
                <dt className={styles.kvLabel}>티켓 매수</dt>{/* 라벨 멍 */}
                <dd className={styles.kvValue}>
                  {/* 숫자 정렬을 위해 tabular-nums 적용됨 멍 */}
                  {bookingProduct.ticket}매{/* 값 멍 */}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* 우측: 가격 요약 멍 */}
        <div className={styles.right}>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>총 결제 금액</span>{/* 요약 라벨 멍 */}
            <strong className={styles.totalPrice} aria-label={`총 결제 금액 ${priceDisplay}`}>
              {priceDisplay}{/* 빨간색·탭숫자 강조 멍 */}
            </strong>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BookingProductInfo // 기본 내보내기 멍
