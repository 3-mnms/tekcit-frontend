import { useState } from 'react'
import styles from '@pages/payment/DeliveryManagePage.module.css'
import { Address } from '@models/delivery/Address.ts'
import Button from '@/components/common/button/Button'

interface Address {
  id: number
  name: string
  address1: string
  address2: string
  isDefault: boolean
}

const DeliveryManagePage = () => {
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses)

  const setAsDefault = (id: number) => {
    const updated = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    }))
    setAddresses(updated)
  }

  const deleteAddress = (id: number) => {
    setAddresses(addresses.filter(addr => addr.id !== id))
  }

  return (
    <div className={styles['container']}>
      <h2 className={styles['title']}>배송지 관리</h2>

      <ul className={styles['address-list']}>
        {addresses.map(addr => (
          <li key={addr.id} className={styles['address-item']}>
            <div className={styles['address-info']}>
              <p className={styles['name']}>{addr.name}</p>
              <p>{addr.address1} {addr.address2}</p>
              {addr.isDefault && <span className={styles['default-label']}>기본 배송지</span>}
            </div>
            <div className={styles['buttons']}>
              <button onClick={() => setAsDefault(addr.id)}>기본 설정</button>
              <button onClick={() => deleteAddress(addr.id)}>삭제</button>
            </div>
          </li>
        ))}
      </ul>

      <div className={styles['footer']}>
        <Button className={styles['add-button']}>배송지 추가</Button>
      </div>
    </div>
  )
}

export default DeliveryManagePage
