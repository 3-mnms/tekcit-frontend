import { useEffect, useState, useMemo } from 'react'
import type { AxiosError } from 'axios'

import AddressItem from '@/components/payment/address/AddressItem'
import Header from '@components/payment/delivery/DeliveryHeader'
import Footer from '@components/payment/delivery/DeliveryFooter'
import { getAddress, type AddressDTO } from '@/shared/api/payment/address'

import styles from './DeliveryManageModal.module.css'

interface DeliveryManageModalProps {
  onClose?: () => void
  onSelectAddress?: (addr: {
    name?: string         
    phone?: string         
    address: string        
    zipCode?: string      
    isDefault?: boolean    
  }) => void
}

const DeliveryManageModal: React.FC<DeliveryManageModalProps> = ({
  onClose,
  onSelectAddress,
}) => {
  const [addresses, setAddress] = useState<AddressDTO[]>([])         // 목록
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null) // 선택 인덱스
  const [loading, setLoading] = useState(false)                        // 로딩
  const [error, setError] = useState<string | null>(null)              // 에러 메시지
  const [authRequired, setAuthRequired] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    setAuthRequired(false)
    try {
      const list = await getAddress()
      setAddress(list ?? [])

      const defaultIdx = (list ?? []).findIndex(a => a.default === true)
      setSelectedIndex(defaultIdx >= 0 ? defaultIdx : null)
    } catch (e: unknown) {
      const axErr = e as AxiosError<{ message?: string }>
      const status = axErr?.response?.status

      if (status === 401) {
        setAuthRequired(true)
      } else if (axErr?.response?.data?.message) {
        setError(axErr.response.data.message)
      } else if (axErr?.message) {
        setError(axErr.message)
      } else if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('배송지 목록을 불러오지 못했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const selected = useMemo(
    () => (selectedIndex !== null ? addresses[selectedIndex] : undefined),
    [selectedIndex, addresses],
  )

  const handleSelectButton = () => {
    if (!selected) return
    onSelectAddress?.({
      name: selected.name,
      phone: selected.phone,
      address: selected.address,
      zipCode: selected.zipCode,
      isDefault: selected.default,
    })
    onClose?.()
  }

  return (
    <div className={styles.container}>
      <Header onClose={() => onClose?.()} />

      {loading && <p className={styles.info}>배송지 불러오는 중…</p>}
      {!loading && authRequired && (
        <p className={styles.info}>세션이 만료되었습니다. 다시 로그인해 주세요.</p>
      )}
      {!loading && !authRequired && error && (
        <p className={styles.error}>{error}</p>
      )}
      {!loading && !authRequired && !error && addresses.length === 0 && (
        <p className={styles.info}>등록된 배송지가 없습니다.</p>
      )}

      {!loading && !authRequired && !error && (
        <div className={styles['address-wrapper']}>
          <ul className={styles['address-list']}>
            {addresses.map((addr, idx) => (
              <li
                key={`${addr.address}-${addr.zipCode}-${idx}`} 
                className={`${styles['address-list-item']} ${
                  selectedIndex === idx ? styles.selected : ''
                }`}
                onClick={() => setSelectedIndex(idx)}
              >
                <AddressItem
                  name={addr.name}
                  phone={addr.phone}
                  address={addr.address}
                  zipCode={addr.zipCode}
                  isDefault={!!addr.default}
                  selected={selectedIndex === idx}
                  onClick={() => setSelectedIndex(idx)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <Footer onSelect={handleSelectButton} />
    </div>
  )
}

export default DeliveryManageModal
