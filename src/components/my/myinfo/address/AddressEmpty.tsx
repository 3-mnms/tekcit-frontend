import React from 'react'
import styles from './AddressEmpty.module.css'

const AddressEmpty: React.FC = () => {
  return (
    <div className={styles.emptyCard}>
      <div className={styles.emptyTitle}>등록된 배송지가 없습니다.</div>
      <p className={styles.emptyDesc}>
        아래 “새 배송지 추가” 버튼을 눌러 첫 배송지를 등록해 주세요.
      </p>
    </div>
  )
}

export default AddressEmpty
