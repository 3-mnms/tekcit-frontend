// PaymentInfo.tsx
import styles from '@components/payment/PaymentInfo.module.css'

const PaymentInfo = () => {
  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <div className={styles.posterPlaceholder}></div>
          <div className={styles.title}>페스티벌 제목</div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.infoTable}>
            <tbody>
              <tr>
                <td>일시</td>
              </tr>
              <tr>
                <td>선택좌석</td>
              </tr>
              <tr>
                <td>티켓금액</td>
              </tr>
              <tr>
                <td>수수료</td>
              </tr>
              <tr>
                <td>배송료</td>
              </tr>
              <tr>
                <td>할인</td>
              </tr>
              <tr>
                <td>취소기한</td>
              </tr>
              <tr>
                <td>취소 수수료</td>
              </tr>
              <tr className={styles.total}>
                <td>총 결제 금액</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PaymentInfo
