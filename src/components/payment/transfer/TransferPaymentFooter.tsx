import styles from './TransferPaymentFooter.module.css'

const TransferPaymentFooter: React.FC = () => {
  return (
    <section className={styles.terms}>
      <label className={styles.checkboxLabel}>
        <input type="checkbox" required />
        <span className={styles.checkboxText}>
          (필수) 양도 서비스 이용약관 및 개인정보 수집 및 이용 동의
        </span>
      </label>
    </section>
  )
}

export default TransferPaymentFooter
