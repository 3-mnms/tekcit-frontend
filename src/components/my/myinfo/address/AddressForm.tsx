import React, { useState } from 'react'
import Button from '@/components/common/button/Button'
import FormInput from '@/components/common/input/Input'
import AddressSearchModal from '@/components/auth/signup/AddressSearchModal'
import { useAddAddressMutation } from '@/models/auth/tanstack-query/useAddress'
import styles from './AddressForm.module.css'
import { useNavigate } from 'react-router-dom'
import { FaMapMarkerAlt } from 'react-icons/fa'

const AddressForm: React.FC = () => {
  const [name, setName] = useState('')
  const [zonecode, setZonecode] = useState('')
  const [address, setAddress] = useState('')
  const [addressDetail, setAddressDetail] = useState('')
  const [phone, setPhone] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [openPostcode, setOpenPostcode] = useState(false)

  const addMut = useAddAddressMutation()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!name || !phone || !zonecode || !address) {
      alert('필수 정보를 입력해주세요.')
      return
    }
    const fullAddress = addressDetail ? `${address}, ${addressDetail}` : address
    try {
      await addMut.mutateAsync({
        name,
        phone,
        zipCode: zonecode,
        address: fullAddress,
        isDefault,
      })
      alert('주소가 저장되었습니다.')
      navigate('/mypage/myinfo/address')
    } catch (e: unknown) {
      alert((e as { message?: string }).message ?? '주소 저장에 실패했습니다.')
    }
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>배송지 관리</h2>
      </div>
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.icon}><FaMapMarkerAlt /></span>
        <h3 className={styles.cardTitle}>새 배송지 추가</h3>
      </div>

      <div className={styles.formGrid}>
        <FormInput
          label="받는 분"
          value={name}
          className={styles.input}
          onChange={(e) => setName(e.target.value)}
        />
        <FormInput
          label="연락처"
          value={phone}
          className={styles.input}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="010-0000-0000"
        />
      </div>

      <div className={styles.block}>
        <label className={styles.blockLabel}>주소</label>
        <div className={styles.zipRow}>
          <FormInput
            placeholder="우편번호"
            value={zonecode}
            disabled
            className={styles.zipcode}
          />
          <Button
            onClick={() => setOpenPostcode(true)}
            disabled={addMut.isPending}
            className={styles.searchBtn}
          >
            주소 검색
          </Button>
        </div>
        <FormInput
          placeholder="기본 주소"
          value={address}
          className={styles.address}
          disabled
        />
        <FormInput
          placeholder="상세 주소"
          className={styles.input}
          value={addressDetail}
          onChange={(e) => setAddressDetail(e.target.value)}
        />
      </div>

      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={isDefault}
          onChange={() => setIsDefault(!isDefault)}
        />
        <span>기본 배송지로 설정</span>
      </label>

      <div className={styles.actionRow}>
        <Button
          className={styles.primaryBtn}
          onClick={handleSubmit}
          disabled={addMut.isPending}
        >
          {addMut.isPending ? '저장 중…' : '추가하기'}
        </Button>

        <Button
          className={styles.cancelBtn}
          type="button"
          onClick={() => navigate('/mypage/myinfo/address')}
          disabled={addMut.isPending}
        >
          취소
        </Button>
      </div>

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
     </section>
  )
}

export default AddressForm
