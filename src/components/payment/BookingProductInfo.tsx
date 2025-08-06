import styles from './BookingProductInfo.module.css'

const BookingProductInfo: React.FC = () => {
  return (
    <section className={styles.productSection}>
      <h2 className={styles.sectionTitle}>예매 기본 안내사항</h2>
      <div className={styles.productBox}>
        <div className={styles.productInfo}>
          <p className={styles.productTitle}>N잡의 진심</p>
          <p className={styles.productDetail}>2025.09.21 (일) 오후 3시 · 강남아트홀 1관</p>
          <p className={styles.productSeat}>좌석: R석 1층 B열 13번</p>
        </div>
        <div className={styles.productPrice}>190,000원</div>
      </div>
    </section>
  )
}

export default BookingProductInfo
