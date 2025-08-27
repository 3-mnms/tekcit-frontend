import styles from './BookingProductInfo.module.css'
import { bookingProduct } from '@models/payment/bookingProduct'

const toNumber = (v: unknown): number => {
  if (typeof v === 'number') return v
  const n = parseInt(String(v ?? '').replace(/[^0-9]/g, ''), 10)
  return Number.isFinite(n) ? n : 0
}

const formatKRW = (n: number) => `${n.toLocaleString('ko-KR')}원`

const BookingProductInfo: React.FC = () => {
  const priceNumber = toNumber(bookingProduct.price)
  const priceDisplay = formatKRW(priceNumber)

  return (
    <section className={styles.productSection}>
      <h2 className={styles.sectionTitle}>티켓 주문상세</h2>

      <div className={styles.card}>
        <div className={styles.infoBlock}>
          <h3 className={styles.title}>{bookingProduct.title}</h3>
          <p className={styles.meta}>
            {bookingProduct.datetime} · {bookingProduct.location}
          </p>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>수량</span>
          <span className={styles.value}>{bookingProduct.ticket}매</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>가격정보</span>
          <span className={styles.value}>{priceDisplay}</span>
        </div>
      </div>
    </section>
  )
}

export default BookingProductInfo
