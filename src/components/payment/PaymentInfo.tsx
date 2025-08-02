// PaymentInfo.tsx
import styles from '@components/payment/PaymentInfo.module.css'

const PaymentInfo = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.posterPlaceholder}></div>
        <div className={styles.title}>공연 제목</div>
      </div>

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
            <td>취소수수료</td>
          </tr>
          <tr className={styles.total}>
            <td>총 결제 금액</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default PaymentInfo
