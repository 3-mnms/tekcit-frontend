import { useLocation } from 'react-router-dom'
import styles from './PaymentInfo.module.css'

// 예매 페이지에서 넘겨주는 payload 타입
interface PaymentInfoState {
  bookingId: string
  festivalId: string
  posterUrl?: string
  title: string
  performanceDate: string
  unitPrice: number
  quantity: number
  bookerName?: string
  deliveryMethod: string // 'QR' | 'DELIVERY'
  reservationNumber?: string
}

const PaymentInfo: React.FC = () => {
  // ✅ 라우터 state 수신
  const location = useLocation()
  const state = location.state as PaymentInfoState | undefined

  // 데이터 없으면 표시
  if (!state) return <p>결제 정보가 없습니다.</p>

  // ✅ 여기부터는 state가 정의됨 (TS가 타입을 좁힘)
  const { posterUrl, title, performanceDate, unitPrice, quantity, bookerName, deliveryMethod } =
    state

  // ✅ 총 결제 금액 계산
  const total = unitPrice * quantity

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.posterBox}>
          {posterUrl ? (
            // ✅ 포스터 이미지 표시
            <img src={posterUrl} alt="poster" className={styles.poster} />
          ) : (
            // ✅ 포스터가 없을 때 대체 영역
            <div className={styles.poster}></div>
          )}
        </div>

        {/* ✅ 제목/일시 멍 */}
        <div className={styles.titleBox}>
          <div className={styles.title}>{title}</div>
          <div className={styles.sub}>{performanceDate}</div>
        </div>
      </div>

      {/* ✅ 표 형태 정보 영역 멍 */}
      <div className={styles.table}>
        <div className={styles.row}>
          <div className={styles.label}>예매자</div>
          <div className={styles.value}>{bookerName || '자동입력'}</div>
        </div>

        <div className={styles.row}>
          <div className={styles.label}>수령 방법</div>
          <div className={styles.value}>
            {deliveryMethod === 'QR' ? 'QR 티켓' : 'QR 티켓과 지류 티켓 배송'}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.label}>매수</div>
          <div className={styles.value}>{quantity}매</div>
        </div>

        <div className={styles.row}>
          <div className={styles.label}>티켓 금액</div>
          <div className={styles.value}>{unitPrice.toLocaleString()}원</div>
        </div>

        {/* ✅ 총 결제 금액: 프론트 계산 값 멍 */}
        <div className={`${styles.row} ${styles.totalRow}`}>
          <div className={styles.labelTotal}>총 결제</div>
          <div className={styles.valueTotal}>{total.toLocaleString()}원</div>
        </div>
      </div>

      {/* ✅ 약관 안내 멍 */}
      <div className={styles.notice}>
        결제 진행 시 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.
        <button className={styles.linkBtn}>[상세보기]</button>
      </div>
    </div>
  )
}

export default PaymentInfo
