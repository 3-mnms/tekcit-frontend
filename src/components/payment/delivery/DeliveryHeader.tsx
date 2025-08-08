import XLogo from '@shared/assets/X_logo.png'

import styles from './DeliveryHeader.module.css'

interface HeaderProps {
  onClose?: () => void
}

const Header = ({ onClose }: HeaderProps) => {
  return (
    <div className={styles['delivery-header-top']}>
      <h2 className={styles['title']}>배송지 관리</h2>
      <button className={styles['close-button']} onClick={onClose}>
        <img src={XLogo} alt="닫기" className={styles['close-icon']} />
      </button>
    </div>
  )
}

export default Header
