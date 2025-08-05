import { useState } from 'react'
import styles from '@pages/payment/DeliveryManagePage.module.css'
import { mockAddresses } from '@models/delivery/Address.ts'
import AddressItem from '@/components/payment/AddressItem'
import Header from '@/components/payment/DeliveryHeader'
import Footer from '@/components/payment/DeliveryFooter'

interface Address {
  id: number
  address1: string
  address2: string
  isDefault: boolean
}

const DeliveryManagePage = () => {
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses)

  const setAsDefault = (id: number) => {
    const updated = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === id,
    }))
    setAddresses(updated)
  }

  const handleClose = () => {
    console.log('닫기 버튼 클릭됨!') // 실제로는 모달 닫기
  }

  return (
    <div className={styles.container}>
      <Header onClose={handleClose} />

      <div className={styles['address-wrapper']}>
        <ul className={styles['address-list']}>
          {addresses.map((addr) => (
            <AddressItem
              key={addr.id}
              address1={addr.address1}
              address2={addr.address2}
              isDefault={addr.isDefault}
            />
          ))}
        </ul>
      </div>

      <Footer onSelect={() => console.log('배송지 선택 버튼 클릭됨!')} />
    </div>
  )
}

export default DeliveryManagePage
