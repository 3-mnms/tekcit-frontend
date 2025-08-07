import styles from '@components/payment/delivery/DeliveryFooter.module.css'
import Button from '@/components/common/button/Button'

interface DeliveryFooterProps {
  onSelect?: () => void
}

const DeliveryFooter = ({ onSelect }: DeliveryFooterProps) => {
  return (
    <div className={styles.footer}>
      <Button className={styles.selectButton} onClick={onSelect}>
        배송지 선택
      </Button>
    </div>
  )
}

export default DeliveryFooter
