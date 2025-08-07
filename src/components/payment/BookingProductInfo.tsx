import styles from './BookingProductInfo.module.css'
import { bookingProduct } from '@/models/payment/bookingProduct'

const BookingProductInfo: React.FC = () => {
  return (
    <section className={styles.productSection}>
      <div className={styles.productBox}>
        <div className={styles.productInfo}>
          <p className={styles.productTitle}>{bookingProduct.title}</p>
          <p className={styles.productDetail}>
            {bookingProduct.datetime} · {bookingProduct.location}
          </p>
          <p className={styles.productSeat}>
            티켓 매수: {bookingProduct.ticket}
          </p>

        </div>
        <div className={styles.productPrice}>{bookingProduct.price}</div>
      </div>
    </section>
  )
}

export default BookingProductInfo
