// 3. 개선된 DeliveryManageModal
import { useEffect, useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import AddressItem from '@/components/payment/address/AddressItem'
import Header from '@components/payment/delivery/DeliveryHeader'
import Footer from '@components/payment/delivery/DeliveryFooter'
import { getAddress, getDefaultAddress, AddressQueryKeys, type AddressDTO } from '@/shared/api/payment/address'

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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // React Query로 주소 목록 조회
  const { 
    data: addresses = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: AddressQueryKeys.list(),
    queryFn: getAddress,
    staleTime: 30_000,
    retry: 2,
  })

  // 기본 배송지 조회 (보조적으로)
  const { data: defaultAddress } = useQuery({
    queryKey: AddressQueryKeys.default(),
    queryFn: getDefaultAddress,
    enabled: addresses.length > 0,
    staleTime: 30_000,
  })

  // 기본 배송지 자동 선택
  const defaultIndex = useMemo(() => {
    if (!addresses || addresses.length === 0) return -1
    
    // 1. 목록에서 default: true 찾기
    const fromList = addresses.findIndex(a => a.default || a.isDefault)
    if (fromList >= 0) return fromList
    
    // 2. API로 가져온 기본 배송지와 매칭
    if (defaultAddress) {
      const fromDefault = addresses.findIndex(a => 
        a.id === defaultAddress.id ||
        (a.address === defaultAddress.address && a.zipCode === defaultAddress.zipCode)
      )
      if (fromDefault >= 0) return fromDefault
    }
    
    // 3. 첫 번째 항목
    return addresses.length > 0 ? 0 : -1
  }, [addresses, defaultAddress])

  // 자동 선택 적용
  useEffect(() => {
    if (defaultIndex >= 0 && selectedIndex === null) {
      setSelectedIndex(defaultIndex)
    }
  }, [defaultIndex, selectedIndex])

  // 선택된 주소 객체
  const selected = useMemo(
    () => (selectedIndex !== null ? addresses[selectedIndex] : undefined),
    [selectedIndex, addresses],
  )

  // 선택 버튼 핸들러
  const handleSelectButton = () => {
    if (!selected) return
    
    onSelectAddress?.({
      name: selected.name,
      phone: selected.phone,
      address: selected.address,
      zipCode: selected.zipCode,
      isDefault: selected.default || selected.isDefault,
    })
    onClose?.()
  }

  // 인증 오류 감지
  const isAuthError = (error as AxiosError)?.response?.status === 401

  return (
    <div className={styles.container}>
      <Header onClose={() => onClose?.()} />

      {/* 로딩 상태 */}
      {isLoading && (
        <p className={styles.info}>배송지 불러오는 중…</p>
      )}

      {/* 인증 오류 */}
      {!isLoading && isAuthError && (
        <div className={styles.error}>
          <p>세션이 만료되었습니다. 다시 로그인해 주세요.</p>
          <button onClick={() => window.location.reload()}>
            페이지 새로고침
          </button>
        </div>
      )}

      {/* 기타 오류 */}
      {!isLoading && isError && !isAuthError && (
        <div className={styles.error}>
          <p>배송지를 불러오지 못했습니다.</p>
          <button onClick={() => refetch()}>다시 시도</button>
          <details style={{ marginTop: 10, fontSize: '0.9em' }}>
            <summary>오류 상세</summary>
            <pre>{(error as Error)?.message}</pre>
          </details>
        </div>
      )}

      {/* 데이터 없음 */}
      {!isLoading && !isError && addresses.length === 0 && (
        <p className={styles.info}>
          등록된 배송지가 없습니다. 마이페이지에서 배송지를 추가해 주세요.
        </p>
      )}

      {/* 주소 목록 */}
      {!isLoading && !isError && addresses.length > 0 && (
        <div className={styles['address-wrapper']}>
          <ul className={styles['address-list']}>
            {addresses.map((addr, idx) => (
              <li
                key={addr.id || `${addr.address}-${addr.zipCode}-${idx}`} 
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
                  isDefault={addr.default || addr.isDefault || false}
                  selected={selectedIndex === idx}
                  onClick={() => setSelectedIndex(idx)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <Footer 
        onSelect={handleSelectButton} 
        disabled={!selected} // 선택된 주소가 없으면 버튼 비활성화
      />
    </div>
  )
}

export default DeliveryManageModal