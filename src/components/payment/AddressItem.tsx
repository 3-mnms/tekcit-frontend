import styles from '@components/payment/AddressItem.module.css'
import Button from '@/components/common/button/Button'

interface AddressItemProps {
  address1: string
  address2: string
  isDefault: boolean
  onClick?: () => void
  selected?: boolean // ✅ 추가
}

const AddressItem = ({
  address1,
  address2,
  isDefault,
  onClick,
  selected = false, // ✅ 기본값 false
}: AddressItemProps) => {
  return (
    <Button
      onClick={onClick}
      className={`${styles.addressItem} ${selected ? styles.selected : ''}`} // ✅ class 조건부 적용
    >
      <div className={styles.addressInfo}>
        <div className={styles.addressRow}>
          <p className={styles.addressText}>
            {address1} {address2}
          </p>
          {isDefault && <span className={styles.defaultLabel}>기본 배송지</span>}
        </div>
      </div>
    </Button>
  )
}

export default AddressItem
