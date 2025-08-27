import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import DeliveryManageModal from '@/components/payment/modal/DeliveryManageModal'

import styles from './AddressForm.module.css'

interface AddressFormProps {
  onValidChange?: (isValid: boolean) => void
}

const schema = z.object({
  name: z.string().optional(),
  phonePrefix: z.enum(['010', '011', '016', '017', '018', '019']).optional(),
  phonePart1: z.string().optional(),
  phonePart2: z.string().optional(),
  address: z.string().min(1, '주소를 입력해 주세요.'),
  zipCode: z.string().optional(),
})

type AddressFormInputs = z.infer<typeof schema>

type SelectedAddressPayload = {
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

  // address만 채워지면 유효(true)로 상위에 전달
  useEffect(() => {
    const isValid = !!watchAll.address?.trim()
    onValidChange?.(!!isValid)
  }, [watchAll, onValidChange])

  // 모달에서 배송지 선택 시: address/zipCode만 주입(이름/전화는 그대로 유지)
  const handleAddressSelect = (addr: SelectedAddressPayload) => {
    setValue('address', addr.address ?? '', { shouldValidate: true })
    setValue('zipCode', addr.zipCode ?? '', { shouldValidate: true })
    setIsModalOpen(false)
  }

  return (
    <form className={styles['address-container']}>
      <div className={styles['address-tabs']}>
        <span className={styles['tabs-label']}>배송지 선택</span>

        <button
          type="button"
          className={`plain-button ${styles['tab-manage-btn']}`}
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

      {/* 폼 영역 */}
      <div className={styles['form-grid']}>
        <div className={styles['form-left']}>
          <label>받는 사람</label>
          <input type="text" {...register('name')} />
          {errors.name && <p className={styles['error']}>{errors.name.message}</p>}

          <label>연락처</label>
          <div className={styles['phone-inputs']}>
            <div className={styles['phone-box']}>
              <select {...register('phonePrefix')}>
                <option value="010">010</option>
                <option value="011">011</option>
                <option value="016">016</option>
                <option value="017">017</option>
                <option value="018">018</option>
                <option value="019">019</option>
              </select>
              <div className={styles['error-space']}>
                {errors.phonePrefix && (
                  <p className={styles['error']}>{errors.phonePrefix.message}</p>
                )}
              </div>
            </div>
            <div className={`${styles['phone-box']} ${styles['phone-part1']}`}>
              <input type="text" maxLength={4} {...register('phonePart1')} />
              <div className={styles['error-space']}>
                {errors.phonePart1 && (
                  <p className={styles['error']}>{errors.phonePart1.message}</p>
                )}
              </div>
            </div>
            <div className={`${styles['phone-box']} ${styles['phone-part2']}`}>
              <input type="text" maxLength={4} {...register('phonePart2')} />
              <div className={styles['error-space']}>
                {errors.phonePart2 && (
                  <p className={styles['error']}>{errors.phonePart2.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles['form-right']}>
          {/* 주소(필수) */}
          <label>주소 *</label>
          <div className={styles['address-row']}>
            <input
              type="text"
              placeholder="주소를 선택하거나 입력해 주세요"
              {...register('address')}
            />
            <button
              type="button"
              className={`plain-button ${styles['address-search-btn']}`}
              onClick={() => setIsModalOpen(true)}
            >
              주소 검색
            </button>
          </div>
          {errors.address && <p className={styles['error']}>{errors.address.message}</p>}

          {/* 우편번호(선택) */}
          <input
            type="text"
            placeholder="우편번호 (선택)"
            {...register('zipCode')}
          />
          {errors.zipCode && <p className={styles['error']}>{errors.zipCode.message}</p>}
        </div>
      </div>
    </form>
  )
}

export default AddressForm
