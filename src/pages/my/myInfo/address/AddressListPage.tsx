// src/pages/my/myinfo/address/AddressListPage.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import AddressItem from '@/components/my/myinfo/address/AddressItem'
import AddressEmpty from '@/components/my/myinfo/address/AddressEmpty'
import Button from '@/components/common/button/Button'
import styles from './AddressListPage.module.css'
import {
  useAddressesQuery,
} from '@/models/auth/tanstack-query/useAddress' // ✅ 경로 수정

const AddressListPage: React.FC = () => {
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useAddressesQuery()

  const goNew = () => navigate('new')

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>배송지 관리</h2>

      <div className={styles.list}>
        {(isLoading || isError) && (
          <div className={styles.card}>
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
            {!(data && data.some((addr) => addr.address && addr.address.trim() !== '')) ? (
              <AddressEmpty />
            ) : (
              <div className={styles.card}>
                {(data ?? []).map((addr) => (
                  <AddressItem
                    key={addr.id} 
                    name={addr.name}
                    phone={addr.phone}
                    zipCode={addr.zipCode}
                    address={addr.address}
                    isDefault={addr.isDefault}
                    onClick={() => {
                      navigate(`/mypage/myinfo/address/${addr.id}`)
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Button className={styles.addButton} onClick={goNew}>
        + 새 배송지 추가
      </Button>
    </section>
  )
}

export default AddressListPage
