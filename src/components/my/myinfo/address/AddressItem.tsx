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
        <div className={styles.topRow}>
          <div className={styles.namePhone}>
            <span>{name}</span>
            <span className={styles.phone}>{phone}</span>
          </div>
          {isDefault && <span className={styles.badge}>기본 배송지</span>}
        </div>
        <div className={styles.address}>
          ({zipCode}) {address}
        </div>
      </div>
      <span className={styles.arrow}>›</span>
    </div>
  )
}

export default AddressItem
