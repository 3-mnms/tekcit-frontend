// 배송지 목록 조회 + 선택 컴포넌트

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getAddress, type AddressDTO } from '@/shared/api/payment/address'
import Button from '@/components/common/button/Button'
import styles from './AddressItem.module.css'

export interface AddressItemProps {
  name: string               // 수령인 이름
  phone: string              // 전화번호
  address: string            // 단일 주소
  zipCode?: string           // 우편번호(있으면 표시)
  isDefault: boolean         // 기본 배송지 여부
  selected?: boolean         // 선택 상태
  onClick?: () => void       // 클릭 콜백
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
  // ✅ 우편번호가 있으면 [12345] 형태로 prefix
  const line = `${zipCode ? `[${zipCode}] ` : ''}${address}`

  return (
    <Button
      onClick={onClick}
      className={`${styles.addressItem} ${selected ? styles.selected : ''}`}
    >
      <div className={styles.addressInfo}>
        {/* 첫 줄: 이름 + 전화번호 */}
        <div className={styles.addressRow}>
          <p className={styles.nameText}>{name}</p>
          <p className={styles.phoneText}>{phone}</p>
        </div>

        {/* 두 번째 줄: 주소 + 기본배송지 여부 */}
        <div className={styles.addressRow}>
          <p className={styles.addressText}>{line}</p>
          {isDefault && <span className={styles.defaultLabel}>기본 배송지</span>}
        </div>
      </div>
    </Button>
  )
}

// view model (화면용 데이터 구조)
type AddressVM = {
  name: string
  phone: string
  address: string
  zipCode?: string
  isDefault: boolean
}

function mapToVM(list: AddressDTO[]): AddressVM[] {
  return list.map((a) => ({
    name: a.name,
    phone: a.phone,
    address: a.address,
    zipCode: a.zipCode,
    isDefault: a.default,
  }))
}

type AddressListProps = {
  onChangeSelected?: (index: number) => void // 선택 변경 시 상위로 전달(선택)
}

// 배송지 목록
export function AddressList({ onChangeSelected }: AddressListProps) {
  // ✅ React Query로 목록 조회 (axios 인터셉터/재발급과 자동 연동)
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['address'],
    queryFn: getAddress,
    select: mapToVM,
    staleTime: 60_000, // 1분
  })

  // 기본 배송지 자동 선택
  const defaultIndex = useMemo(
    () => (data ? data.findIndex(d => d.isDefault) : -1),
    [data]
  )
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  useEffect(() => {
    if (defaultIndex >= 0) setSelectedIndex(defaultIndex)
  }, [defaultIndex])

  // 예외 처리 (경고 문구 출력)
  if (isLoading) return <div>주소를 불러오는 중입니다…</div>
  if (isError) {
    return (
      <div>
        주소를 불러오지 못했어요. <button onClick={() => refetch()}>다시 시도</button>
        <pre style={{ whiteSpace: 'pre-wrap', color: '#d33' }}>
          {(error as Error)?.message}
        </pre>
      </div>
    )
  }
  if (!data || data.length === 0) {
    return <div>등록된 배송지가 없습니다. 마이페이지에서 새 주소를 추가해 주세요.</div>
  }

  // 주소 목록 렌더링
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {data.map((item, idx) => (
        <AddressItem
          key={idx}                        // ✅ 단순히 인덱스를 key로 사용
          name={item.name}
          phone={item.phone}
          address={item.address}
          zipCode={item.zipCode}
          isDefault={item.isDefault}
          selected={selectedIndex === idx}    // ✅ 선택 여부는 인덱스로 판단
          onClick={() => {
            setSelectedIndex(idx)              // ✅ 선택 인덱스 저장
            onChangeSelected?.(idx)            // ✅ 부모에 인덱스 전달
          }}
        />
      ))}
    </div>
  )
}

export default AddressItem
