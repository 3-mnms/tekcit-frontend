import styles from './PaymentInfo.module.css'

interface PaymentInfoProps {
  posterUrl?: string
  title: string
  dateTimeLabel: string
  unitPrice: number
  quantity: number
  receiveType: string
  buyerName?: string
}

// ✅ 함수형 컴포넌트로 정의
const PaymentInfo: React.FC<PaymentInfoProps> = ({
  posterUrl,
  title,
  dateTimeLabel,
  unitPrice,
  quantity,
  receiveType,
  buyerName,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.posterBox}>
          {posterUrl ? (
            <img src={posterUrl} alt="poster" className={styles.poster} />
          ) : (
            <div className={styles.poster}>???</div>
          )}
        </div>
        <div className={styles.titleBox}>
          <div className={styles.title}>{title}</div>
          <div className={styles.sub}>{dateTimeLabel}</div>
        </div>
      </div>

      <div className={styles.table}>
        <div className={styles.row}>
          <div className={styles.label}>예매자</div>
          <div className={styles.value}>{buyerName ?? '자동입력'}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>수령 방법</div>
          <div className={styles.value}>{receiveType === 'QR' ? 'QR 티켓' : '배송'}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>매수</div>
          <div className={styles.value}>{quantity}매</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>티켓 금액</div>
          <div className={styles.value}>{unitPrice.toLocaleString()}원</div>
        </div>
        <div className={`${styles.row} ${styles.totalRow}`}>
          <div className={styles.labelTotal}>총 결제</div>
          <div className={styles.valueTotal}>
            {(unitPrice * quantity).toLocaleString()}원
          </div>
        </div>
      </div>

      <div className={styles.notice}>
        결제 진행 시 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.
        <button className={styles.linkBtn}>[상세보기]</button>
      </div>
    </div>
  )
}

export default PaymentInfo
