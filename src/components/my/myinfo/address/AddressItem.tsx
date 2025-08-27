import React from 'react'
import styles from './AddressItem.module.css'

interface AddressItemProps {
  name: string
  phone: string
  zipCode: string
  address: string
  isDefault?: boolean
  onClick?: () => void
}

const AddressItem: React.FC<AddressItemProps> = ({
  name,
  phone,
  zipCode,
  address,
  isDefault = false,
  onClick,
}) => {
  return (
    <div className={styles.item} onClick={onClick}>
      <div className={styles.content}>
        {/* 이름 + 배지 (같은 줄) */}
        <div className={styles.topRow}>
          <span className={styles.name}>{name}</span>
          {isDefault && <span className={styles.badge}>기본 배송지</span>}
        </div>

        {/* 전화번호 (아래 줄) */}
        <div className={styles.phoneRow}>
          <span className={styles.phone}>{phone}</span>
        </div>

        {/* 주소 */}
        <div className={styles.address}>
          ({zipCode}) {address}
        </div>
      </div>

      <span className={styles.arrow}>›</span>
    </div>
  )
}

export default AddressItem
