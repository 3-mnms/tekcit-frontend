// AddressDetailPage.tsx
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '@/components/common/button/Button'
import Input from '@/components/common/input/Input'
import AddressSearchModal from '@/components/auth/signup/AddressSearchModal'
import styles from './AddressDetailPage.module.css'
import {
  useAddressQuery,
  useDeleteAddressMutation,
  useUpdateAddressMutation,
} from '@/models/auth/tanstack-query/useAddress'
import { useQueryClient } from '@tanstack/react-query'

const AddressDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const addressId = Number(id) || 0
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: address, isLoading, isError } = useAddressQuery(addressId)
  const deleteAddressMut = useDeleteAddressMutation()
  const updateAddressMut = useUpdateAddressMutation()

  const [editing, setEditing] = useState(false)
  const [openPostcode, setOpenPostcode] = useState(false)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [zonecode, setZonecode] = useState('')
  const [baseAddress, setBaseAddress] = useState('')
  const [addressDetail, setAddressDetail] = useState('')
  const [isDefault, setIsDefault] = useState(false)

  const splitAddress = (full?: string) => {
    const s = (full ?? '').trim()
    if (!s) return { base: '', detail: '' }
    const idx = s.indexOf(', ')
    if (idx === -1) return { base: s, detail: '' }
    return { base: s.slice(0, idx), detail: s.slice(idx + 2) }
  }

  const pickIsDefault = (raw: unknown) => {
    if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, any>
      if ('isDefault' in obj) return Boolean(obj.isDefault)
      if ('default' in obj) return Boolean(obj.default)
    }
    return false
  }

  useEffect(() => {
    if (!address) return
    console.log('address', pickIsDefault(address))
    const { base, detail } = splitAddress(address.address)
    setName(address.name || '')
    setPhone(address.phone || '')
    setZonecode(address.zipCode || '')
    setBaseAddress(base)
    setAddressDetail(detail)
    setIsDefault(pickIsDefault(address))
  }, [address])

  const handleDelete = () => {
    if (!addressId) return
    if (!window.confirm('정말 이 배송지를 삭제하시겠습니까?')) return
    deleteAddressMut.mutate(addressId, {
      onSuccess: () => {
        alert('배송지가 삭제되었습니다.')
        qc.invalidateQueries({ queryKey: ['addresses'] })
        qc.invalidateQueries({ queryKey: ['addresses', 'default'] })
        navigate('/my/address')
      },
      onError: (e: any) => {
        alert(e?.response?.data?.message || '배송지 삭제에 실패했습니다.')
      },
    })
  }

  const startEdit = () => setEditing(true)

  const cancelEdit = () => {
    if (!address) return
    setEditing(false)
    const { base, detail } = splitAddress(address.address)
    setName(address.name || '')
    setPhone(address.phone || '')
    setZonecode(address.zipCode || '')
    setBaseAddress(base)
    setAddressDetail(detail)
    setIsDefault(pickIsDefault(address))
  }

  const joinAddress = (addr?: string, detail?: string) => {
    const a = (addr ?? '').trim()
    const d = (detail ?? '').trim()
    if (!a && !d) return ''
    if (!d) return a
    if (a.endsWith(d) || a.endsWith(`, ${d}`)) return a
    return `${a}${a.endsWith(',') ? ' ' : ', '}${d}`
  }

  const saveEdit = async () => {
    if (!name || !phone || !zonecode || !baseAddress) {
      alert('필수 정보를 입력해주세요.')
      return
    }
    const fullAddress = joinAddress(baseAddress, addressDetail)
    const payload = { name, phone, zipCode: zonecode, address: fullAddress, isDefault } // ✅ isDefault 포함
    console.log('[PATCH payload]', payload)
    try {
      await updateAddressMut.mutateAsync({ addressId, payload })
      alert('주소가 저장되었습니다.')
      setEditing(false)
      qc.invalidateQueries({ queryKey: ['addresses'] })
      qc.invalidateQueries({ queryKey: ['addresses', addressId] })
      qc.invalidateQueries({ queryKey: ['addresses', 'default'] })
    } catch (e: any) {
      console.log('[PATCH error]', e?.response?.status, e?.response?.data)
      alert(e?.response?.data?.message || '주소 저장에 실패했어요.')
    }
  }

  if (isLoading) {
    return (
      <section className={styles.container}>
        <div className={styles.panel}>
          <div className={styles.skeleton} />
        </div>
      </section>
    )
  }

  if (isError || !address) {
    return (
      <section className={styles.container}>
        <div className={styles.panel}>
          <div className={styles.errorText}>주소 정보를 불러올 수 없습니다.</div>
          <Button className={styles.fullButton} onClick={() => navigate('/my/address')}>
            목록으로 돌아가기
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>배송지 상세</h2>

      <div className={styles.panel}>
        <div className={styles.form}>
          <Input
            label="수령인"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!editing}
          />
          <Input
            label="연락처"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!editing}
            type="tel"
            className={styles.phoneInput}
          />

          <div className={styles.addressGroup}>
            <label className={styles.label}>주소</label>

            <div className={styles.addressRow}>
              <Input
                placeholder="우편번호"
                value={zonecode}
                onChange={(e) => setZonecode(e.target.value)}
                disabled={!editing}
                className={styles.zonecodeInput}
              />
              <div className={styles.searchButtonWrapper}>
                <Button
                  onClick={() => editing && setOpenPostcode(true)}
                  disabled={!editing}
                  className={styles.searchButton}
                >
                  주소 검색
                </Button>
              </div>
            </div>

            <Input
              placeholder="기본주소"
              value={baseAddress}
              onChange={(e) => setBaseAddress(e.target.value)}
              disabled={!editing}
              className={styles.addressInput}
            />
            <Input
              placeholder="상세주소"
              value={addressDetail}
              onChange={(e) => setAddressDetail(e.target.value)}
              disabled={!editing}
              className={styles.detailInput}
            />
          </div>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              disabled={!editing}
            />
            <span>기본 배송지로 설정</span>
          </label>
        </div>

        <div className={styles.actions}>
          {!editing ? (
            <>
              <Button className={styles.actionButton} onClick={startEdit}>
                수정
              </Button>
              <Button className={styles.actionButton} onClick={handleDelete}>
                삭제
              </Button>
            </>
          ) : (
            <>
              <Button
                className={`${styles.actionButton} ${styles.outlineButton}`}
                onClick={cancelEdit}
                disabled={updateAddressMut.isPending}
              >
                취소
              </Button>
              <Button
                className={styles.actionButton}
                onClick={saveEdit}
                disabled={updateAddressMut.isPending}
              >
                {updateAddressMut.isPending ? '저장 중…' : '저장'}
              </Button>
            </>
          )}
        </div>
      </div>

      {openPostcode && editing && (
        <AddressSearchModal
          onComplete={({ zipCode, address }) => {
            setZonecode(zipCode)
            setBaseAddress(address)
            setOpenPostcode(false)
          }}
          onClose={() => setOpenPostcode(false)}
        />
      )}
    </section>
  )
}

export default AddressDetailPage
