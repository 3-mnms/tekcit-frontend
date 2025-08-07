import { useNavigate } from 'react-router-dom'
import Button from '@/components/common/button/Button'
import styles from './CancelSuccessPage.module.css'

const CancelSuccessPage: React.FC = () => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.message}>예매 취소 성공</h1>
      <Button className="w-[120px] h-[36px]" onClick={handleGoHome}>
        홈으로 가기
      </Button>
    </div>
  )
}

export default CancelSuccessPage
