import Button from '@/components/common/button/Button'
import styles from './AddressItem.module.css'

export interface AddressItemProps {
  address: string            // 단일 주소
  zipCode?: string           // 우편번호(있으면 표시)
  isDefault: boolean         // 기본 배송지 여부
  selected?: boolean         // 선택 상태
  onClick?: () => void       // 클릭 콜백
}

const AddressItem = ({
  address,
  zipCode,
  isDefault,
  selected = false,
  onClick,
}: AddressItemProps) => {
  const line = `${zipCode ? `[${zipCode}] ` : ''}${address}`

  return (
    <Button
      onClick={onClick}
      className={`${styles.addressItem} ${selected ? styles.selected : ''}`}
    >
      <div className={styles.addressInfo}>
        <div className={styles.addressRow}>
          <p className={styles.addressText}>{line}</p>
          {isDefault && <span className={styles.defaultLabel}>기본 배송지</span>}
        </div>
      </div>
    </Button>
  )
}

export default AddressItem
