import { useState } from 'react'
import { mockAddresses } from '@/models/payment/Address'
import type { Address } from '@/models/payment/Address'
import AddressItem from '@/components/payment/address/AddressItem'
import Header from '@components/payment/delivery/DeliveryHeader'
import Footer from '@components/payment/delivery/DeliveryFooter'

import styles from './DeliveryManageModal.module.css'

interface DeliveryManagePageProps {
  onClose?: () => void
  onSelectAddress?: (addr: { address1: string; address2: string }) => void
}

const DeliveryManagePage: React.FC<DeliveryManagePageProps> = ({ onClose, onSelectAddress }) => {
  const [addresses] = useState<Address[]>(mockAddresses)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // 선택된 주소 객체 반환
  const selectedAddress = addresses.find(addr => addr.id === selectedId)

  const handleSelect = (addrId: number) => {
    setSelectedId(addrId)
  }

  // "배송지 선택" 버튼 클릭
  const handleSelectButton = () => {
    if (selectedAddress) {
      onSelectAddress?.({
        address1: selectedAddress.address1,
        address2: selectedAddress.address2,
      })
      onClose?.()
    }
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
            <li
              key={addr.id}
              className={`${styles['address-list-item']} ${selectedId === addr.id ? styles.selected : ''}`}
              onClick={() => handleSelect(addr.id)}
              style={{ cursor: 'pointer' }}
            >
              <AddressItem
                address1={addr.address1}
                address2={addr.address2}
                isDefault={addr.isDefault}
              />
            </li>
          ))}
        </ul>
      </div>

      <Footer
        onSelect={handleSelectButton}
        // Footer 컴포넌트에 버튼 label, disabled 등 커스텀 props가 있으면 전달!
      />
    </div>
  )
}

export default DeliveryManagePage
