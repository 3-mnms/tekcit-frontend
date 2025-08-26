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
    name?: string          // 수령인 이름
    phone?: string         // 수령인 전화번호
    address: string        // 선택된 주소
    zipCode?: string       // 우편번호
    isDefault?: boolean    // 기본 배송지 여부
  }) => void
}

// ✅ React.FC로 선언하되, JSX를 반드시 return 해야 함
const DeliveryManageModal: React.FC<DeliveryManageModalProps> = ({
  onClose,
  onSelectAddress,
}) => {
  // 상태들
  const [addresses, setAddress] = useState<AddressDTO[]>([])         // 목록
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null) // 선택 인덱스
  const [loading, setLoading] = useState(false)                        // 로딩
  const [error, setError] = useState<string | null>(null)              // 에러 메시지
  const [authRequired, setAuthRequired] = useState(false)

  // 목록 로드 함수
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

  // ✅ 반드시 JSX를 반환해야 React.FC에 맞음
  return (
    <div className={styles.container}>
      <Header onClose={() => onClose?.()} />

      {/* 상태 메시지 */}
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

      {/* 주소 목록 */}
      {!loading && !authRequired && !error && addresses.length > 0 && (
        <div className={styles['address-wrapper']}>
          <ul className={styles['address-list']}>
            {addresses.map((addr, idx) => (
              <li
                key={`${addr.address}-${addr.zipCode}-${idx}`} // id 대신 안전한 fallback 키
                className={`${styles['address-list-item']} ${
                  selectedIndex === idx ? styles.selected : ''
                }`}
                onClick={() => setSelectedIndex(idx)}
                style={{ cursor: 'pointer' }}
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
