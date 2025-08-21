// 📄 src/components/payment/delivery/DeliveryManageModal.tsx 멍
// - 단순 조회 + 선택 모달 컴포넌트
// - axios 기반 getAddresses 사용, AbortController 제거
// - catch는 unknown으로 받아 타입/ESLint 만족

import { useEffect, useState } from 'react'
import AddressItem from '@/components/payment/address/AddressItem'
import Header from '@components/payment/delivery/DeliveryHeader'
import Footer from '@components/payment/delivery/DeliveryFooter'
import { getAddresses, type AddressDTO } from '@/shared/api/payment/addresses'

import styles from './DeliveryManageModal.module.css'

// ✅ props 타입 정의
interface DeliveryManageModalProps {
  onClose?: () => void
  onSelectAddress?: (addr: {
    address: string       // 선택된 주소
    zipCode?: string      // 우편번호(선택)
    id?: number           // 서버 id(선택)
  }) => void
}

// ✅ React.FC로 선언하되, JSX를 반드시 return 해야 함
const DeliveryManageModal: React.FC<DeliveryManageModalProps> = ({
  onClose,
  onSelectAddress,
}) => {
  // 상태들
  const [addresses, setAddresses] = useState<AddressDTO[]>([])   // 목록
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null) // 선택 인덱스
  const [loading, setLoading] = useState(false)                  // 로딩
  const [error, setError] = useState<string | null>(null)        // 에러 메시지
  const [authRequired, setAuthRequired] = useState(false)        // 401 여부

  // 목록 로드 함수
  const load = async () => {
    setLoading(true)
    setError(null)
    setAuthRequired(false)

    try {
      const list = await getAddresses()            // ✅ 단순 조회
      setAddresses(list ?? [])                     // ✅ 빈배열 안전
      setSelectedIndex(null)                       // ✅ 선택 초기화
    } catch (e: unknown) {
      // ✅ Axios 인터셉터에서 status를 부여해두었다면 안전하게 판별
      const status = (e as { status?: number })?.status
      if (status === 401) {
        setAuthRequired(true)
      } else if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('배송지 목록을 불러오지 못했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  // 마운트 시 1회 로드
  useEffect(() => {
    load()
  }, [])

  // 선택된 아이템 도출
  const selected = selectedIndex !== null ? addresses[selectedIndex] : undefined

  // 하단 선택 버튼 클릭 시 상위로 콜백
  const handleSelectButton = () => {
    if (!selected) return
    onSelectAddress?.({
      address: selected.address,
      zipCode: selected.zipCode,
      id: selected.id,
    })
    onClose?.()
  }

  // ✅ 반드시 JSX를 반환해야 React.FC에 맞음
  return (
    <div className={styles.container}>
      <Header onClose={() => onClose?.()} />

      {/* 상태 표시 */}
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

      {/* 목록 */}
      {!loading && !authRequired && !error && addresses.length > 0 && (
        <div className={styles['address-wrapper']}>
          <ul className={styles['address-list']}>
            {addresses.map((addr, idx) => (
              <li
                key={addr.id ?? `${addr.address}-${addr.zipCode}-${idx}`} // id 없을 때 안전 키
                className={`${styles['address-list-item']} ${selectedIndex === idx ? styles.selected : ''}`}
                onClick={() => setSelectedIndex(idx)}
                style={{ cursor: 'pointer' }}
              >
                <AddressItem
                  address={addr.address}
                  zipCode={addr.zipCode}
                  isDefault={!!addr.isDefault}
                  selected={selectedIndex === idx}
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
