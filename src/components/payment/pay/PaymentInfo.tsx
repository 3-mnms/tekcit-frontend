import styles from './PaymentInfo.module.css'

const deliveryType = 'QR'

const PaymentInfo = () => {
  const posterUrl = '/images/festival-poster.jpg' // public/images에 저장

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          {/* 🔹 포스터 이미지 + 네모 placeholder */}
          <div className={styles.posterWrapper}>
            {posterUrl ? (
              <img
                src={posterUrl}
                alt="페스티벌 포스터"
                className={styles.posterImage}
              />
            ) : (
              <div className={styles.posterPlaceholder}></div>
            )}
          </div>

          <div className={styles.title}>
            <span>페스티벌 제목</span>
          </div>
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
