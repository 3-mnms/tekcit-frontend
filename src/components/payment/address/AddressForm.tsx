// src/components/payment/address/AddressForm.tsx
import React, { useEffect, useState, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import AddressSearchModal from '@/components/auth/signup/AddressSearchModal'
import DeliveryManageModal from '@/components/payment/modal/DeliveryManageModal'
import styles from './AddressForm.module.css'

interface AddressFormProps {
  onValidChange?: (isValid: boolean) => void
}

/** ✅ 상위에서 호출할 수 있는 메서드 타입 */
export type AddressFormHandle = {
  /** 한 줄 주소: "[우편번호] 기본주소, 상세주소" (빈 값은 생략) */
  getAddress: () => string
  /** 주소 유효성 */
  isValid: () => boolean
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
type PhonePrefix = NonNullable<AddressFormInputs['phonePrefix']>

type SelectedAddressPayload = {
  name?: string
  phone?: string
  address: string
  zipCode?: string
  addressDetail?: string
  id?: number
}

function parseAddressString(raw: string): { base: string; detail?: string; zip?: string } {
  if (!raw) return { base: '' }
  let rest = raw.trim()
  let zip: string | undefined
  const zipMatch = rest.match(/^\s*\[(\d{5})\]\s*/)
  if (zipMatch) {
    zip = zipMatch[1]
    rest = rest.replace(/^\s*\[\d{5}\]\s*/, '')
  }
  let base = rest
  let detail: string | undefined
  const commaIdx = rest.indexOf(',')
  if (commaIdx !== -1) {
    base = rest.slice(0, commaIdx).trim()
    detail = rest.slice(commaIdx + 1).trim()
  }
  return { base, detail, zip }
}

const AddressForm = forwardRef<AddressFormHandle, AddressFormProps>(
  ({ onValidChange }, ref) => {
    const {
      register,
      setValue,
      watch,
      formState: { errors, isValid },
    } = useForm<AddressFormInputs>({
      resolver: zodResolver(schema),
      mode: 'onChange',
      defaultValues: {
        name: '',
        phonePrefix: '010',
        phonePart1: '',
        phonePart2: '',
        address: '',
        zipCode: '',
        addressDetail: '',
      },
    })

    const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '')
    }
    const handleNumberKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!/[0-9]/.test(e.key) &&
        !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
        e.preventDefault()
      }
    }

    const [isManageOpen, setIsManageOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    const all = watch()

    useEffect(() => {
      onValidChange?.(!!all.address?.trim())
    }, [all.address, onValidChange])

    const splitKoreanPhone = useCallback((raw?: string): {
      prefix?: PhonePrefix; part1?: string; part2?: string
    } => {
      if (!raw) return {}
      const digits = raw.replace(/\D/g, '')
      if (digits.length < 9) return {}
      const pfx = digits.slice(0, 3) as PhonePrefix
      if (digits.length === 11) return { prefix: pfx, part1: digits.slice(3, 7), part2: digits.slice(7, 11) }
      if (digits.length === 10) return { prefix: pfx, part1: digits.slice(3, 6), part2: digits.slice(6, 10) }
      return { prefix: pfx, part1: digits.slice(3, 7), part2: digits.slice(7) }
    }, [])

    const handleAddressCompleteFromDaum = useCallback(
      (data: { zipCode: string; address: string; addressDetail?: string }) => {
        const { base, detail, zip } = parseAddressString(data.address)
        setValue('address', base || data.address || '', { shouldValidate: true })
        setValue('zipCode', data.zipCode || zip || '', { shouldValidate: true })
        if (data.addressDetail || detail) {
          setValue('addressDetail', data.addressDetail || detail || '', { shouldValidate: false })
        }
        setIsSearchOpen(false)
      },
      [setValue]
    )

    const handleAddressSelectFromManage = useCallback(
      (addr: SelectedAddressPayload) => {
        const { base, detail, zip } = parseAddressString(addr.address)
        setValue('address', base, { shouldValidate: true })
        setValue('zipCode', addr.zipCode || zip || '', { shouldValidate: true })
        if (addr.addressDetail || detail) {
          setValue('addressDetail', addr.addressDetail || detail || '', { shouldValidate: false })
        }
        if (addr.name) setValue('name', addr.name, { shouldValidate: false })
        if (addr.phone) {
          const { prefix, part1, part2 } = splitKoreanPhone(addr.phone)
          if (prefix) setValue('phonePrefix', prefix, { shouldValidate: false })
          if (part1 !== undefined) setValue('phonePart1', part1, { shouldValidate: false })
          if (part2 !== undefined) setValue('phonePart2', part2, { shouldValidate: false })
        }
        setIsManageOpen(false)
      },
      [setValue, splitKoreanPhone]
    )

    /** ✅ 한 줄 주소 합성 */
    const composedAddress = useMemo(() => {
      const a = (all.address ?? '').trim()
      const z = (all.zipCode ?? '').trim()
      const d = (all.addressDetail ?? '').trim()
      const parts: string[] = []
      if (z) parts.push(`[${z}]`)
      if (a) parts.push(a)
      const base = parts.join(' ').trim()
      return d ? `${base}, ${d}` : base
    }, [all.address, all.zipCode, all.addressDetail])

    /** ✅ 상위에서 ref로 현재 상태를 요청할 수 있게 노출 */
    useImperativeHandle(ref, () => ({
      getAddress: () => composedAddress.trim(),
      isValid: () => !!all.address?.trim(),
    }), [composedAddress, all.address])

    return (
      <form className={styles['address-container']}>
        <div className={styles['address-header']}>
          <div className={styles['header-left']}>
            <span className={styles['header-title']}>배송지 선택</span>
          </div>
          <button
            type="button"
            className={`${styles['btn']} ${styles['btn-outline']}`}
            onClick={() => setIsManageOpen(true)}
          >
            배송지 관리
          </button>

          {isManageOpen && (
            <div className={styles['modal-overlay']}>
              <div className={styles['modal-content']}>
                <DeliveryManageModal
                  onClose={() => setIsManageOpen(false)}
                  onSelectAddress={handleAddressSelectFromManage}
                />
              </div>
            </div>
          )}
        </div>

        <div className={styles['form-grid']}>
          {/* 좌측: 받는 사람/연락처 */}
          <div className={styles['form-left']}>
            <label>받는 사람</label>
            <input type="text" {...register('name')} placeholder='홍길동' />
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
              <input type="text" maxLength={4}
                {...register('phonePart1')}
                onInput={handleNumberInput}
                onKeyDown={handleNumberKeyPress}
                placeholder="1234"
              />
              <input type="text" maxLength={4}
                onInput={handleNumberInput}
                onKeyDown={handleNumberKeyPress}
                {...register('phonePart2')}
                placeholder="5678"
              />
            </div>
          </div>

          {/* 우측: 주소 */}
          <div className={styles['form-right']}>
            <label>주소 *</label>
            <div className={styles['address-row']}>
              <input
                type="text"
                placeholder="주소를 선택하거나 입력해 주세요"
                {...register('address')}
              />
              <button
                type="button"
                className={`${styles['btn']} ${styles['btn-secondary']}`}
                onClick={() => setIsSearchOpen(true)}
              >
                주소 검색
              </button>
            </div>
            {errors.address && <p className={styles['error']}>{errors.address.message}</p>}

            <input
              type="text"
              placeholder="우편번호"
              {...register('zipCode')}
              onInput={handleNumberInput}
              onKeyDown={handleNumberKeyPress}
            />
            <input
              type="text"
              placeholder="상세 주소 (동/호수 등)"
              {...register('addressDetail')}
            />
          </div>
        </div>

        {isSearchOpen && (
          <AddressSearchModal
            onComplete={handleAddressCompleteFromDaum}
            onClose={() => setIsSearchOpen(false)}
          />
        )}
      </form>
    )
  }
)

export default AddressForm
