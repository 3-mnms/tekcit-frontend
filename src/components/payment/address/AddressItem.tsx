// 2. 개선된 AddressItem 컴포넌트
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Spinner from '@/components/common/spinner/Spinner'
import { getAddress, getDefaultAddress, AddressQueryKeys, type AddressDTO } from '@/shared/api/payment/address'
import Button from '@/components/common/button/Button'
import styles from './AddressItem.module.css'

export interface AddressItemProps {
  name: string               
  phone: string              
  address: string            
  zipCode?: string           
  isDefault: boolean         
  selected?: boolean         
  onClick?: () => void       
}

export function AddressItem({
  name,
  phone,
  address,
  zipCode,
  isDefault,
  selected = false,
  onClick,
}: AddressItemProps) {
  const line = `${zipCode ? `[${zipCode}] ` : ''}${address}`

  return (
    <Button
      onClick={onClick}
      className={`${styles.addressItem} ${selected ? styles.selected : ''}`}
    >
      <div className={styles.addressInfo}>
        <div className={styles.addressRow}>
          <p className={styles.nameText}>{name}</p>
          <p className={styles.phoneText}>{phone}</p>
        </div>

        <div className={styles.addressRow}>
          <p className={styles.addressText}>{line}</p>
          {isDefault && <span className={styles.defaultLabel}>기본 배송지</span>}
        </div>
      </div>
    </Button>
  )
}

// view model
type AddressVM = {
  id?: number
  name: string
  phone: string
  address: string
  zipCode?: string
  isDefault: boolean
}

function mapToVM(list: AddressDTO[]): AddressVM[] {
  return list.map((a) => ({
    id: a.id,
    name: a.name,
    phone: a.phone,
    address: a.address,
    zipCode: a.zipCode,
    isDefault: a.default || a.isDefault || false,
  }))
}

type AddressListProps = {
  onChangeSelected?: (index: number, address: AddressVM) => void
}

// 개선된 배송지 목록 컴포넌트
export function AddressList({ onChangeSelected }: AddressListProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // 주소 목록 조회
  const { 
    data: addresses, 
    isLoading: isLoadingList, 
    isError: isErrorList, 
    error: errorList, 
    refetch: refetchList 
  } = useQuery({
    queryKey: AddressQueryKeys.list(),
    queryFn: getAddress,
    select: mapToVM,
    staleTime: 60_000,
    retry: 2,
  })

  // 기본 배송지 조회 (fallback)
  const { 
    data: defaultAddress,
    isLoading: isLoadingDefault,
    isError: isErrorDefault
  } = useQuery({
    queryKey: AddressQueryKeys.default(),
    queryFn: getDefaultAddress,
    enabled: !!addresses && addresses.length > 0, // 목록이 있을 때만 실행
    staleTime: 60_000,
    retry: 1,
  })

  // 기본 배송지 자동 선택 로직
  const defaultIndex = useMemo(() => {
    if (!addresses || addresses.length === 0) return -1
    
    // 1. 목록에서 isDefault가 true인 항목 찾기
    const fromList = addresses.findIndex(a => a.isDefault)
    if (fromList >= 0) return fromList
    
    // 2. 별도 API로 가져온 기본 배송지와 매칭
    if (defaultAddress) {
      const fromDefault = addresses.findIndex(a => 
        a.id === defaultAddress.id || 
        (a.address === defaultAddress.address && a.zipCode === defaultAddress.zipCode)
      )
      if (fromDefault >= 0) return fromDefault
    }
    
    // 3. 아무것도 없으면 첫 번째 항목 선택
    return addresses.length > 0 ? 0 : -1
  }, [addresses, defaultAddress])

  // 기본 주소 자동 선택
  useEffect(() => {
    if (defaultIndex >= 0 && selectedIndex === null) {
      setSelectedIndex(defaultIndex)
      if (addresses && onChangeSelected) {
        onChangeSelected(defaultIndex, addresses[defaultIndex])
      }
    }
  }, [defaultIndex, selectedIndex, addresses, onChangeSelected])

  // 로딩 상태
  if (isLoadingList) {
    return <div>주소를 불러오는 중입니다…</div>
  }

  // 에러 상태
  if (isErrorList) {
    return (
      <div>
        <p>주소를 불러오지 못했어요.</p>
        <button onClick={() => refetchList()}>다시 시도</button>
        <details style={{ marginTop: 10, color: '#d33' }}>
          <summary>오류 상세</summary>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {(errorList as Error)?.message}
          </pre>
        </details>
      </div>
    )
  }

  // 데이터 없음
  if (!addresses || addresses.length === 0) {
    return (
      <div>
        <p>등록된 배송지가 없습니다.</p>
        <p>마이페이지에서 새 주소를 추가해 주세요.</p>
      </div>
    )
  }

  // 주소 목록 렌더링
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {isLoadingDefault && <Spinner />}
      
      {addresses.map((item, idx) => (
        <AddressItem
          key={item.id || idx}
          name={item.name}
          phone={item.phone}
          address={item.address}
          zipCode={item.zipCode}
          isDefault={item.isDefault}
          selected={selectedIndex === idx}
          onClick={() => {
            setSelectedIndex(idx)
            onChangeSelected?.(idx, item)
          }}
        />
      ))}
      
      {/* 디버그 정보 (개발 환경에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <details style={{ fontSize: '0.8em', color: '#666', marginTop: 10 }}>
          <summary>디버그 정보</summary>
          <pre>
            {JSON.stringify({
              selectedIndex,
              defaultIndex,
              addressCount: addresses.length,
              hasDefaultFromApi: !!defaultAddress,
              defaultAddressId: defaultAddress?.id,
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}

export default AddressItem