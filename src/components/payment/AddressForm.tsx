// 배송지 입력 폼

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@components/common/button/Button'
import styles from '@components/payment/AddressForm.module.css' // ✅ module.css 적용

const schema = z.object({
  name: z.string().min(1, '이름을 입력해 주세요.'),
  phonePrefix: z.enum(['010', '011', '016', '017', '018', '019']),
  phonePart1: z.string().regex(/^\d{3,4}$/, '3~4자리 숫자'),
  phonePart2: z.string().regex(/^\d{4}$/, '4자리 숫자'),
  address1: z.string().min(1, '주소를 입력해 주세요.'),
  address2: z.string().min(1, '상세 주소를 입력해 주세요.'),
})

type AddressFormInputs = z.infer<typeof schema>

const dummyDefault: AddressFormInputs = {
  name: '홍길동',
  phonePrefix: '010',
  phonePart1: '1234',
  phonePart2: '5678',
  address1: '서울특별시 강남구 테헤란로 123',
  address2: '강남빌딩 101호',
}

const AddressForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormInputs>({ resolver: zodResolver(schema) })

  const [selectedTab, setSelectedTab] = useState<'default' | 'recent' | null>(null)

  const onSubmit = (data: AddressFormInputs) => {
    console.log('제출 데이터:', data)
    alert('배송지 저장 완료!')
  }

  return (
    <form className={styles['address-container']} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles['address-tabs']}>
        <span className={styles['tabs-label']}>배송지 선택</span>
        <Button
          className={`${styles['tab-button']} ${selectedTab === 'default' ? styles['active'] : ''}`}
          onClick={() => {
            setSelectedTab('default')
            reset(dummyDefault)
          }}
        >
          기본
        </Button>
        <button
          type="button"
          className={`plain-button ${styles['tab-manage-btn']}`}
          onClick={() => {
            // TODO: 배송지 관리 페이지로 이동
            // navigate("/address-management");
          }}
        >
          배송지 관리
        </button>
      </div>

      {selectedTab === 'recent' && (
        <div className={styles['recent-address-list-box']}>
          <p>최근 배송지 목록 표시 영역</p>
        </div>
      )}

      <div className={styles['form-grid']}>
        <div className={styles['form-left']}>
          <label>받는 사람 *</label>
          <input type="text" {...register('name')} />
          {errors.name && <p className={styles['error']}>{errors.name.message}</p>}

          <label>연락처 *</label>
          <div className={styles['phone-inputs']}>
            <div className={styles['phone-box']}>
              <select {...register('phonePrefix')}>
                <option value="010">010</option>
                <option value="011">02</option>
              </select>
              <div className={styles['error-space']}>
                {errors.phonePrefix && (
                  <p className={styles['error']}>{errors.phonePrefix.message}</p>
                )}
              </div>
            </div>
            <div className={`${styles['phone-box']} ${styles['phone-part1']}`}>
              <input type="text" maxLength={4} {...register('phonePart1' as const)} />
              <div className={styles['error-space']}>
                {errors.phonePart1 && (
                  <p className={styles['error']}>{errors.phonePart1.message}</p>
                )}
              </div>
            </div>
            <div className={`${styles['phone-box']} ${styles['phone-part2']}`}>
              <input type="text" maxLength={4} {...register('phonePart2' as const)} />
              <div className={styles['error-space']}>
                {errors.phonePart2 && (
                  <p className={styles['error']}>{errors.phonePart2.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles['form-right']}>
          <label>주소 *</label>
          <div className={styles['address-row']}>
            <input type="text" {...register('address1')} />
            <button
              type="button"
              className={`plain-button ${styles['address-search-btn']}`}
              onClick={() => {
                // TODO: 주소 검색 모달 열기
              }}
            >
              주소 검색
            </button>
          </div>
          {errors.address1 && <p className={styles['error']}>{errors.address1.message}</p>}

          <input type="text" placeholder="상세 주소" {...register('address2')} />
          {errors.address2 && <p className={styles['error']}>{errors.address2.message}</p>}
        </div>
      </div>

      <div className={styles['submit-wrap']}>
        <button type="submit" className="plain-button w-full h-12">
          저장
        </button>
      </div>
    </form>
  )
}

export default AddressForm
