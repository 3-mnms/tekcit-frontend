import React from 'react'
import { useNavigate } from 'react-router-dom'
import AddressItem from '@/components/my/myinfo/address/AddressItem'
import AddressEmpty from '@/components/my/myinfo/address/AddressEmpty'
import Button from '@/components/common/button/Button'
import styles from './AddressListPage.module.css'
import { useAddressesQuery } from '@/models/auth/tanstack-query/useAddress'

const AddressListPage: React.FC = () => {
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useAddressesQuery()

  const goNew = () => navigate('new')

  const hasAny =
    (data && data.some((a) => (a.address ?? '').trim() !== '')) ?? false

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>배송지 관리</h2>
      </div>

      {/* 로딩/에러 */}
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
              {(error as any)?.message ?? '주소 목록을 불러오지 못했어요.'}
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
              {(data ?? []).map((addr) => (
                <AddressItem
                  key={addr.id}
                  id={String(addr.id)}
                  name={addr.name}
                  phone={addr.phone}
                  zipCode={addr.zipCode}
                  address={addr.address}
                  isDefault={addr.isDefault}
                  // 시안의 "연필"=수정 클릭 시 상세로 이동(수정 흐름 유지)
                  onEdit={() => navigate(`/mypage/myinfo/address/${addr.id}`)}
                  // 항목 클릭 시에도 상세로 이동
                  onClick={() => navigate(`/mypage/myinfo/address/${addr.id}`)}
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
