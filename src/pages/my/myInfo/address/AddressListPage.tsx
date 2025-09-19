// src/pages/my/myInfo/address/AddressListPage.tsx
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AddressItem from '@/components/my/myinfo/address/AddressItem'
import AddressEmpty from '@/components/my/myinfo/address/AddressEmpty'
import Button from '@/components/common/button/Button'
import styles from './AddressListPage.module.css'
import { useAddressesQuery, useDeleteAddressMutation } from '@/models/auth/tanstack-query/useAddress'
import { useQueryClient } from '@tanstack/react-query'

const AddressListPage: React.FC = () => {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data, isLoading, isError, error } = useAddressesQuery()
  const deleteAddressMut = useDeleteAddressMutation()

  const goNew = () => navigate('new')

  const handleDelete = (addressId: number) => {
    if (!addressId) return
    if (!window.confirm('정말 이 배송지를 삭제하시겠습니까?')) return

    deleteAddressMut.mutate(addressId, {
      onSuccess: () => {
        alert('배송지가 삭제되었습니다.')
        qc.invalidateQueries({ queryKey: ['addresses'] })
        qc.invalidateQueries({ queryKey: ['addresses', 'default'] })
      },
      onError: (e: unknown) => {
        const msg =
          (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          '배송지 삭제에 실패했습니다.'
        alert(msg)
      },
    })
  }

  const isBlank = (v?: string | null) => {
    const t = (v ?? '').trim().toLowerCase();
    return t === '' || t === 'null';
  };

  const valid = useMemo(
    () => (data ?? []).filter(a => !isBlank(a.address)),
    [data]
  );

  const hasAny = valid.length > 0;

  const sorted = useMemo(
    () => valid.slice().sort(
      (a, b) => Number(b?.isDefault ?? false) - Number(a?.isDefault ?? false)
    ),
    [valid]
  );

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>배송지 관리</h2>
      </div>

      {(isLoading || isError) && (
        <div className={styles.skelCard}>
          {isLoading && (
            <>
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonLine} />
            </>
          )}
          {isError && (
            <div className={styles.errorText}>
              {(error as { message?: string })?.message ?? '주소 목록을 불러오지 못했어요.'}
            </div>
          )}
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {!hasAny ? (
            <AddressEmpty />
          ) : (
            <div className={styles.list}>
              {sorted.map((addr) => (
                <AddressItem
                  key={addr.id}
                  id={Number(addr.id)}
                  name={addr.name}
                  phone={addr.phone}
                  zipCode={addr.zipCode}
                  address={addr.address}
                  isDefault={addr.isDefault}
                  onEdit={() => navigate(`/mypage/myinfo/address/${addr.id}`)}
                  onClick={() => navigate(`/mypage/myinfo/address/${addr.id}`)}
                  onDelete={() => handleDelete(Number(addr.id))}
                />
              ))}
            </div>
          )}
        </>
      )}

      <Button className={styles.addButton} onClick={goNew}>
        <span className={styles.addIcon}>＋</span> 새 배송지 추가
      </Button>
    </section>
  )
}

export default AddressListPage
