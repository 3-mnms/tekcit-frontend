import React from 'react'
import styles from './AddressItem.module.css'
import { FaHome, FaBuilding, FaEdit, FaTrash } from 'react-icons/fa'

interface AddressItemProps {
  id?: string
  name: string
  phone: string
  zipCode: string
  address: string
  isDefault?: boolean
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

const AddressItem: React.FC<AddressItemProps> = ({
  name,
  phone,
  zipCode,
  address,
  isDefault = false,
  onClick,
  onEdit,
  onDelete,
}) => {
  const isHome = name === '집'

  return (
    <div className={styles.item} onClick={onClick} role="button">
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.titleRow}>
            <span className={styles.iconWrap}>
              {isHome ? <FaHome /> : <FaBuilding />}
            </span>
            <span className={styles.recipient}>{name}</span>
            {isDefault && <span className={styles.badge}>기본 배송지</span>}
          </div>

          <div className={styles.info}>
            <div className={styles.phone}>{phone}</div>
            <div className={styles.addr}>
              ({zipCode}) {address}
            </div>
          </div>
        </div>

        <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
          <button
            className={`${styles.actionBtn} ${styles.editBtn}`}
            onClick={onEdit}
            aria-label="주소 수정"
            type="button"
          >
            <FaEdit />
          </button>
          <button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={onDelete}
            aria-label="주소 삭제"
            type="button"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddressItem
