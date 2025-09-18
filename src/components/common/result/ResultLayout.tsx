import { useNavigate } from 'react-router-dom'
import Button from '@/components/common/button/Button'
import styles from '@/pages/payment/result/BookingResultPage.module.css'

export default function ResultLayout({
  title,
  message,
  primary,
  isSuccess,
  warningMessage,
}: {
  title: string
  message: string
  primary: { label: string; to: string }
  isSuccess: boolean
  warningMessage?: string
}) {
  const navigate = useNavigate()

  const handleConfirm = () => {
    if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
      window.close()
    } else {
      navigate(primary.to)
    }
  }

  const handleGoToTickets = () => {
    navigate('/mypage/ticket/history')
  }

  const handleRetry = () => {
    navigate(-1)
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          {isSuccess ? (
            <>
              <div className={styles.iconSuccess}>
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="40" fill="#22C55E"/>
                  <path 
                    d="M25 40L35 50L55 30" 
                    stroke="white" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className={styles.title}>{title}</h1>
              <p className={styles.message}>
                {message}
              </p>
              {warningMessage && (
                <div className={styles.infoBox}>
                  <p className={styles.infoText}>
                    {warningMessage}
                  </p>
                </div>
              )}
              <div className={styles.buttons}>
                <Button 
                  onClick={handleConfirm}
                  variant="outline"
                  className={styles.secondaryButton}
                >
                  확인
                </Button>
                <Button
                  onClick={handleGoToTickets}
                  variant="primary"
                  className={styles.primaryButton}
                >
                  예매 티켓 확인
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.iconFail}>
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="40" fill="#EF4444"/>
                  <path 
                    d="M30 30L50 50M50 30L30 50" 
                    stroke="white" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h1 className={styles.title}>{title}</h1>
              <p className={styles.message}>
                {message}
              </p>
              {warningMessage && (
                <div className={styles.warningBox}>
                  <p className={styles.warningText}>
                    {warningMessage}
                  </p>
                </div>
              )}
              <div className={styles.buttons}>
                <Button 
                  onClick={handleConfirm}
                  variant="outline"
                  className={styles.secondaryButton}
                >
                  확인
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}