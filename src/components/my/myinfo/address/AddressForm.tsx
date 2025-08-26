// src/components/my/myinfo/AddressForm.tsx
import React, { useState } from 'react'
import Button from '@/components/common/button/Button'
import FormInput from '@/components/common/input/Input'
import AddressSearchModal from '@/components/auth/signup/AddressSearchModal'
import { useAddAddressMutation } from '@/models/auth/tanstack-query/useAddress'
import styles from './AddressForm.module.css'
import { useNavigate } from 'react-router-dom'

const AddressForm: React.FC = () => {
  const [name, setName] = useState('')
  const [zonecode, setZonecode] = useState('')
  const [address, setAddress] = useState('')
  const [addressDetail, setAddressDetail] = useState('')
  const [phone, setPhone] = useState('')
  const [isDefault, setIsDefault] = useState(false) // 서버에서 기본설정은 별도 API, 이 값은 로컬 UI만
  const [openPostcode, setOpenPostcode] = useState(false)

  const addMut = useAddAddressMutation()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    // 최소 유효성
    if (!name || !phone || !zonecode || !address) {
      alert('필수 정보를 입력해주세요.')
      return
    }

    // 서버 DTO에는 addressDetail이 없으므로, 필요 시 address에 합쳐서 보냄
    const fullAddress = addressDetail ? `${address} ${addressDetail}` : address

    try {
      await addMut.mutateAsync({
        name,
        phone,
        zipCode: zonecode,
        address: fullAddress,
      })
      if (isDefault) {
        // 새로 생성된 주소의 id를 모르면 기본설정 호출 불가.
        // 현재 스펙상 AddressDTO에 id가 없으므로, 기본설정은 목록에서 선택 후 처리로 유도.
        // (리스트로 돌아가서 방금 추가한 항목의 "기본설정" 버튼을 눌러 처리하는 UX)
      }
      alert('주소가 저장되었습니다.')
      navigate('/my/info/addresses') // 실제 경로에 맞게 수정
    } catch (e: any) {
      alert(e?.message ?? '주소 저장에 실패했어요.')
    }
  }

  return (
    <div className={styles.form}>
      <FormInput label="이름" value={name} onChange={(e) => setName(e.target.value)} />

      <div className={styles.addressGroup}>
        <label className={styles.label}>배송지</label>

        <div className={styles.addressRow}>
          <FormInput placeholder="우편번호" value={zonecode} disabled className={styles.zonecodeInput} />
          <div className={styles.searchButtonWrapper}>
            <Button onClick={() => setOpenPostcode(true)} disabled={addMut.isPending}>
              주소 검색
            </Button>
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

      <div className={styles.checkboxWrapper}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={isDefault}
            onChange={() => setIsDefault(!isDefault)}
          />
          <span>기본 배송지로 설정 (목록에서 설정)</span>
        </label>
      </div>

      <Button className={styles.submitButton} onClick={handleSubmit} disabled={addMut.isPending}>
        {addMut.isPending ? '저장 중...' : '저장'}
      </Button>

      {openPostcode && (
        <AddressSearchModal
          onComplete={({ zipCode, address }) => {
            setZonecode(zipCode)
            setAddress(address)
            setOpenPostcode(false)
          }}
          onClose={() => setOpenPostcode(false)}
        />
      )}
    </div>
  )
}

export default AddressForm
