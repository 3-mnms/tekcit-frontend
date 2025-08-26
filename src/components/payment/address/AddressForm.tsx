import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import DeliveryManageModal from '@/components/payment/modal/DeliveryManageModal'
import styles from './AddressForm.module.css'

interface AddressFormProps {
  onValidChange?: (isValid: boolean) => void
}

/* 검증 스키마 */
const schema = z.object({
  name: z.string().optional(),
  phonePrefix: z.enum(['010', '011', '016', '017', '018', '019']).optional(),
  phonePart1: z.string().optional(),
  phonePart2: z.string().optional(),
  address: z.string().min(1, '주소를 입력해 주세요.'),
  zipCode: z.string().optional(),
})

type AddressFormInputs = z.infer<typeof schema>

/* 모달에서 받는 타입 */
type SelectedAddressPayload = {
  name?: string
  phone?: string
  address: string
  zipCode?: string
  id?: number
}

const AddressForm: React.FC<AddressFormProps> = ({ onValidChange }) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
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
    },
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const watchAll = watch()

  /* address 입력 시 유효 여부 전달 */
  useEffect(() => {
    const isValid = !!watchAll.address?.trim()
    onValidChange?.(!!isValid)
  }, [watchAll, onValidChange])

  /* 전화번호 분리 */
  const splitKoreanPhone = useCallback((raw?: string) => {
    if (!raw) return {}
    const digits = raw.replace(/\D/g, '')
    if (digits.length < 9) return {}
    const pfx = digits.slice(0, 3) as any
    if (digits.length === 11) {
      return { prefix: pfx, part1: digits.slice(3, 7), part2: digits.slice(7, 11) }
    }
    if (digits.length === 10) {
      return { prefix: pfx, part1: digits.slice(3, 6), part2: digits.slice(6, 10) }
    }
    return { prefix: pfx, part1: digits.slice(3, 7), part2: digits.slice(7) }
  }, [])

  /* 모달에서 선택 시 값 주입 */
  const handleAddressSelect = useCallback((addr: SelectedAddressPayload) => {
    setValue('address', addr.address ?? '', { shouldValidate: true })
    setValue('zipCode', addr.zipCode ?? '', { shouldValidate: true })
    if (addr.name) setValue('name', addr.name, { shouldValidate: false })
    if (addr.phone) {
      const { prefix, part1, part2 } = splitKoreanPhone(addr.phone)
      if (prefix) setValue('phonePrefix', prefix, { shouldValidate: false })
      if (part1 !== undefined) setValue('phonePart1', part1, { shouldValidate: false })
      if (part2 !== undefined) setValue('phonePart2', part2, { shouldValidate: false })
    }
    setIsModalOpen(false)
  }, [setValue, splitKoreanPhone])

  return (
    <form className={styles['address-container']}>
      <div className={styles['address-header']}>
        <div className={styles['header-left']}>
          <span className={styles['header-title']}>배송지 선택</span>
        </div>

        <button
          type="button"
          className={`${styles['btn']} ${styles['btn-outline']}`}
          onClick={() => setIsModalOpen(true)}
        >
          배송지 관리
        </button>

        {isModalOpen && (
          <div className={styles['modal-overlay']}>
            <div className={styles['modal-content']}>
              <DeliveryManageModal
                onClose={() => setIsModalOpen(false)}
                onSelectAddress={handleAddressSelect}
              />
            </div>
          </div>
        )}
      </div>

      <div className={styles['form-grid']}>
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
              onClick={() => setIsModalOpen(true)}
            >
              주소 검색
            </button>
          </div>
          {errors.address && <p className={styles['error']}>{errors.address.message}</p>}

          <input type="text" placeholder="우편번호 (선택)" {...register('zipCode')} />
        </div>
      </div>
    </form>
  )
}

export default AddressForm
