import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import AddressSearchModal from '@/components/auth/signup/AddressSearchModal'
import DeliveryManageModal from '@/components/payment/modal/DeliveryManageModal'

import styles from './AddressForm.module.css'

interface AddressFormProps {
  // 폼 유효 여부(주소 입력 여부) 상위로 전달
  onValidChange?: (isValid: boolean) => void
}

const schema = z.object({
  name: z.string().optional(),
  phonePrefix: z.enum(['010', '011', '016', '017', '018', '019']).optional(),
  phonePart1: z.string().optional(),
  phonePart2: z.string().optional(),
  address: z.string().min(1, '주소를 입력해 주세요.'),
  zipCode: z.string().optional(),
  addressDetail: z.string().optional(),
})

type AddressFormInputs = z.infer<typeof schema>

// ✅ 배송지 관리 모달에서 전달 받을 페이로드 타입
type SelectedAddressPayload = {
  name?: string
  phone?: string
  address: string
  zipCode?: string
  id?: number
}

// ✅ phonePrefix의 정확한 타입 별칭 (any 제거)
type PhonePrefix = NonNullable<AddressFormInputs['phonePrefix']>

const AddressForm: React.FC<AddressFormProps> = ({ onValidChange }) => {
  // ✅ RHF 초기화
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormInputs>({
    resolver: zodResolver(schema),
    mode: 'onChange', // 입력 즉시 검증
    defaultValues: {
      name: '',
      phonePrefix: '010',
      phonePart1: '',
      phonePart2: '',
      address: '',
      zipCode: '',
    },
  })

  // ✅ 모달 상태 - 이름을 명확히 분리해서 혼선 방지
  const [isManageOpen, setIsManageOpen] = useState(false) // 배송지 관리 모달
  const [isSearchOpen, setIsSearchOpen] = useState(false) // 다음 주소 검색 모달

  // ✅ RHF 값 구독
  const watchAll = watch()

  // ✅ 주소 입력 여부를 상위로 알림 (필요 없으면 onValidChange 전달 안 해도 됨)
  useEffect(() => {
    const isValid = !!watchAll.address?.trim()
    onValidChange?.(isValid)
  }, [watchAll, onValidChange])

  const splitKoreanPhone = useCallback((raw?: string): {
    prefix?: PhonePrefix
    part1?: string
    part2?: string
  } => {
    if (!raw) return {}
    const digits = raw.replace(/\D/g, '') // 숫자만 추출
    if (digits.length < 9) return {}

    const pfx = digits.slice(0, 3) as PhonePrefix
    if (digits.length === 11) {
      // 예: 010-1234-5678
      return { prefix: pfx, part1: digits.slice(3, 7), part2: digits.slice(7, 11) }
    }
    if (digits.length === 10) {
      // 예: 011-123-4567
      return { prefix: pfx, part1: digits.slice(3, 6), part2: digits.slice(6, 10) }
    }
    // 길이가 애매하면 best-effort로 3-4-나머지
    return { prefix: pfx, part1: digits.slice(3, 7), part2: digits.slice(7) }
  }, [])

  const handleAddressCompleteFromDaum = useCallback(
    (data: { zipCode: string; address: string }) => {
      // 선택된 주소/우편번호를 RHF에 주입
      setValue('address', data.address ?? '', { shouldValidate: true })
      setValue('zipCode', data.zipCode ?? '', { shouldValidate: true })
      // 모달 닫기
      setIsSearchOpen(false)
    },
    [setValue]
  )

  const handleAddressSelectFromManage = useCallback(
    (addr: SelectedAddressPayload) => {
      // 주소/우편번호 주입
      setValue('address', addr.address ?? '', { shouldValidate: true })
      setValue('zipCode', addr.zipCode ?? '', { shouldValidate: true })

      // 선택한 배송지에 수령인/연락처가 있다면 함께 반영
      if (addr.name) {
        setValue('name', addr.name, { shouldValidate: false })
      }
      if (addr.phone) {
        const { prefix, part1, part2 } = splitKoreanPhone(addr.phone)
        if (prefix) setValue('phonePrefix', prefix, { shouldValidate: false })
        if (part1 !== undefined) setValue('phonePart1', part1, { shouldValidate: false })
        if (part2 !== undefined) setValue('phonePart2', part2, { shouldValidate: false })
      }

      // 모달 닫기
      setIsManageOpen(false)
    },
    [setValue, splitKoreanPhone]
  )

  return (
    <form className={styles['address-container']}>
      {/* ───────── 헤더: 타이틀 + '배송지 관리' 버튼 ───────── */}
      <div className={styles['address-header']}>
        <div className={styles['header-left']}>
          <span className={styles['header-title']}>배송지 선택</span>
        </div>

        {/* ✅ 배송지 관리 모달 오픈 버튼 */}
        <button
          type="button"
          className={`${styles['btn']} ${styles['btn-outline']}`}
          onClick={() => setIsManageOpen(true)} // ❗ setIsModalOpen → setIsManageOpen 로 수정
        >
          배송지 관리
        </button>

        {/* ✅ 배송지 관리 모달 */}
        {isManageOpen && (
          <div className={styles['modal-overlay']}>
            <div className={styles['modal-content']}>
              <DeliveryManageModal
                onClose={() => setIsManageOpen(false)}
                onSelectAddress={handleAddressSelectFromManage} // ❗ 미정의였던 핸들러 구현/연결
              />
            </div>
          </div>
        )}
      </div>

      <div className={styles['form-grid']}>
        {/* 좌측: 받는 사람/연락처 */}
        <div className={styles['form-left']}>
          <label>받는 사람</label>
          <input type="text" {...register('name')} />
          {errors.name && <p className={styles['error']}>{errors.name.message}</p>}

          <label>연락처</label>
          <div className={styles['phone-inputs']}>
            <select {...register('phonePrefix')}>
              <option value="010">010</option>
              <option value="011">011</option>
              <option value="016">016</option>
              <option value="017">017</option>
              <option value="018">018</option>
              <option value="019">019</option>
            </select>
            <input type="text" maxLength={4} {...register('phonePart1')} />
            <input type="text" maxLength={4} {...register('phonePart2')} />
          </div>
        </div>

        {/* 우측: 주소 + 주소 검색 버튼 */}
        <div className={styles['form-right']}>
          <label>주소 *</label>
          <div className={styles['address-row']}>
            <input
              type="text"
              placeholder="주소를 선택하거나 입력해 주세요"
              {...register('address')}
            />
            {/* ✅ 다음 주소 검색 모달 열기 멍 */}
            <button
              type="button"
              className={`${styles['btn']} ${styles['btn-secondary']}`}
              onClick={() => setIsSearchOpen(true)}
            >
              주소 검색
            </button>
          </div>
          {errors.address && <p className={styles['error']}>{errors.address.message}</p>}

          {/* 우편번호(선택) */}
          <input type="text" placeholder="우편번호 (선택)" {...register('zipCode')} />

           <input
            type="text"
            placeholder="상세 주소 (동/호수 등)"
            {...register('addressDetail')}
          />
        </div>
      </div>

      {/* ✅ 다음 주소 검색 모달 */}
      {isSearchOpen && (
        <AddressSearchModal
          onComplete={handleAddressCompleteFromDaum}
          onClose={() => setIsSearchOpen(false)}
        />
      )}
    </form>
  )
}

export default AddressForm
