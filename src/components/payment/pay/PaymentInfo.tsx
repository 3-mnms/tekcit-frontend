import styles from '@components/payment/pay/PaymentInfo.module.css'

const deliveryType = 'QR'

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
                <td className={styles.value}>2025년 8월 2일 (토) 18:00</td>
              </tr>
              <tr>
                <td className={styles.label}>티켓 매수</td>
                <td className={styles.value}>2매</td>
              </tr>
              <tr>
                <td className={styles.label}>티켓 금액</td>
                <td className={styles.value}>77,000원</td>
              </tr>
              <tr>
                <td className={styles.label}>수령 방법</td>
                <td className={styles.value}>
                  {deliveryType === 'QR' ? 'QR 티켓' : '지류 티켓'}
                </td>
              </tr>

              {/* 배송료는 여전히 조건부 렌더링 */}
              {deliveryType === 'QR' ? (
                <tr>
                  <td className={styles.label}>배송료</td>
                  <td className={styles.value}>없음</td>
                </tr>
              ) : (
                <tr>
                  <td className={styles.label}>배송료</td>
                  <td className={styles.value}>3,000원</td>
                </tr>
              )}

              <tr className={styles.totalRow}>
                <td className={styles.totalLabel}>총 결제 금액</td>
                <td className={styles.totalValue}>157,000원</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PaymentInfo
