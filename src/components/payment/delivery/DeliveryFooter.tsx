import Button from '@/components/common/button/Button'

import styles from './DeliveryFooter.module.css'

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
