import React, { useState } from 'react'
import Button from '@/components/common/button/Button'
import FormInput from '@/components/common/input/Input'
import styles from './AddressForm.module.css'

const AddressForm: React.FC = () => {
  const [name, setName] = useState('')
  const [zonecode, setZonecode] = useState('')
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
        setZonecode(data.zonecode || '')
        setAddress(data.address || '')
      },
    }).open()
  }

  return (
    <div className={styles.form}>
      <FormInput label="이름" value={name} onChange={(e) => setName(e.target.value)} />

      <div className={styles.addressGroup}>
        <label className={styles.label}>배송지</label>

        <div className={styles.addressRow}>
          <FormInput
            placeholder="우편번호"
            value={zonecode}
            disabled
            className={styles.zonecodeInput}
          />
          <div className={styles.searchButtonWrapper}>
            <Button onClick={handleSearchAddress}>주소 검색</Button>
          </div>
        </div>

        <FormInput placeholder="주소" value={address} disabled className={styles.addressInput} />

        <FormInput
          placeholder="상세주소"
          value={addressDetail}
          onChange={(e) => setAddressDetail(e.target.value)}
          className={styles.detailInput}
        />
      </div>

      <FormInput
        label="전화번호"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <label className={styles.checkboxLabel}>
        <input type="checkbox" checked={isDefault} onChange={() => setIsDefault(!isDefault)} />
        기본 배송지로 설정
      </label>

      <Button className={styles.submitButton}>저장</Button>
    </div>
  )
}

export default AddressForm
