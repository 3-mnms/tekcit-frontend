import { useState } from 'react'
import styles from '@pages/payment/DeliveryManagePage.module.css'
import { mockAddresses } from '@models/delivery/Address'
import type { Address } from '@models/delivery/Address'
import AddressItem from '@/components/payment/AddressItem'
import Header from '@/components/payment/DeliveryHeader'
import Footer from '@/components/payment/DeliveryFooter'

interface DeliveryManagePageProps {
  onClose?: () => void
}

const DeliveryManagePage: React.FC<DeliveryManagePageProps> = ({ onClose }) => {
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses)

  const setAsDefault = (id: number) => {
    const updated = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === id,
    }))
    setAddresses(updated)
  }

  const handleClose = () => {
    onClose?.()
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
