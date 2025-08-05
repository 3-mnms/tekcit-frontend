import React, { useState } from 'react'
import Button from '@/components/common/button/Button'
import FormInput from '@/components/common/input/Input'
import styles from './AddressForm.module.css'

const AddressForm: React.FC = () => {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [addressDetail, setAddressDetail] = useState('') 
  const [phone, setPhone] = useState('')
  const [isDefault, setIsDefault] = useState(false)

  const handleSearchAddress = () => {
    new window.daum.Postcode({
      oncomplete: function (data: {
        address: string
        addressType?: string
        bname?: string
        buildingName?: string
        zonecode?: string
        [key: string]: unknown
      }) {
        const fullAddress = data.address
        setAddress(fullAddress)
      },
    }).open()
  }

  return (
    <div className={styles.form}>
      {/* 이름 */}
      <FormInput label="이름" value={name} onChange={(e) => setName(e.target.value)} />

      {/* 주소 + 검색 버튼 */}
      <div className={styles.addressGroup}>
        <div className={styles.addressRow}>
          {/* ✅ label 사용하고 placeholder 제거 */}
          <FormInput label="주소" value={address} disabled className={styles.addressInput} />
          <div className={styles.searchButtonWrapper}>
            <Button onClick={handleSearchAddress}>주소 검색</Button>
          </div>
        </div>

        {/* ✅ 상세주소 */}
        <FormInput
          placeholder="상세주소"
          value={addressDetail}
          onChange={(e) => setAddressDetail(e.target.value)}
          className={styles.detailInput}
        />
      </div>

      {/* 전화번호 */}
      <FormInput
        label="전화번호"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      {/* 기본 배송지 체크박스 */}
      <label className={styles.checkboxLabel}>
        <input type="checkbox" checked={isDefault} onChange={() => setIsDefault(!isDefault)} />
        기본 배송지로 설정
      </label>

      {/* 저장 버튼 */}
      <Button className={styles.submitButton}>저장</Button>
    </div>
  )
}

export default AddressForm
