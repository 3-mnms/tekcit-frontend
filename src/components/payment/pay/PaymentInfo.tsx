// PaymentInfo.tsx
import styles from '@components/payment/pay/PaymentInfo.module.css'

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
              <tr className={styles.firstRow}>
                <td className={styles.label}>일시</td>
                <td className={styles.value}>2025년 8월 2일(토) 18:00</td>
              </tr>
              <tr>
                <td className={styles.label}>선택좌석</td>
                <td className={styles.value}>전석1층-5열-70</td>
              </tr>
              <tr>
                <td className={styles.label}>티켓금액</td>
                <td className={styles.value}>77,000원</td>
              </tr>
              <tr>
                <td className={styles.label}>수수료</td>
                <td className={styles.value}>2,000원</td>
              </tr>
              <tr>
                <td className={styles.label}>배송료</td>
                <td className={styles.value}>0원 | 현장수령</td>
              </tr>
              <tr>
                <td className={styles.label}>할인</td>
                <td className={styles.value}>0원</td>
              </tr>
              <tr>
                <td className={styles.label}>할인쿠폰</td>
                <td className={styles.value}>적용 없음</td>
              </tr>
              <tr>
                <td className={styles.label}>취소기한</td>
                <td className={styles.value + ' ' + styles.warning}>2025년 8월 1일(금) 17:00</td>
              </tr>
              <tr>
                <td className={styles.label}>취소수수료</td>
                <td className={styles.value}>
                  티켓금액의 0~30%
                </td>
              </tr>
              <tr className={styles.totalRow}>
                <td className={styles.totalLabel}>총 결제금액</td>
                <td className={styles.totalValue}>79,000원</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PaymentInfo
