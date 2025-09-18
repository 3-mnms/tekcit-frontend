// src/pages/payment/transfer/TransferResultPage.tsx
import { useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '@/components/common/button/Button'
import styles from './TransferResultPage.module.css'

const TransferResultPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status')
  
  const isSuccess = status === 'success'

  useEffect(() => {
    // 올바르지 않은 상태로 접근한 경우 홈으로 리디렉트
    if (!status || (status !== 'success' && status !== 'fail')) {
      navigate('/')
    }
  }, [status, navigate])

  const handleGoToTickets = () => {
    navigate('/mypage/ticket/history')
  }

  const handleGoToHome = () => {
    navigate('/')
  }

  if (!status) return null

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
              <h1 className={styles.title}>양도가 완료되었습니다!</h1>
              <p className={styles.message}>
                티켓 양도가 성공적으로 처리되었습니다.<br />
                양도받은 티켓은 마이페이지에서 확인하실 수 있습니다.
              </p>
              <div className={styles.buttons}>
                <Button 
                  onClick={handleGoToTickets}
                  className={styles.primaryButton}
                >
                  내 티켓 보기
                </Button>
                <Button 
                  onClick={handleGoToHome}
                  variant="outline"
                  className={styles.secondaryButton}
                >
                  홈으로 가기
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
              <h1 className={styles.title}>양도 처리에 실패했습니다</h1>
              <p className={styles.message}>
                티켓 양도 처리 중 오류가 발생했습니다.<br />
                잠시 후 다시 시도해 주시거나 고객센터에 문의해 주세요.
              </p>
              <div className={styles.buttons}>
                <Button 
                  onClick={() => navigate(-1)}
                  className={styles.primaryButton}
                >
                  다시 시도
                </Button>
                <Button 
                  onClick={handleGoToHome}
                  variant="outline"
                  className={styles.secondaryButton}
                >
                  홈으로 가기
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransferResultPage