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

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>배송지 관리</h2>

      <div className={styles.list}>
        {isLoading && (
          <div className={styles.card}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonLine} />
          </div>
        )}

        {isError && (
          <div className={styles.card}>
            <div className={styles.errorText}>
              {(error as any)?.message ?? '주소 목록을 불러오지 못했어요.'}
            </div>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {!(data && data.length > 0) ? (
              <AddressEmpty onAdd={goNew} />
            ) : (
              (data ?? []).map((addr, idx) => (
                <div className={styles.card} key={idx}>
                  <AddressItem
                    label={`${addr.name} · ${addr.phone}`}
                    isDefault={addr.isDefault}
                    onClick={() => {
                    }}
                  />
                  <div className={styles.meta}>
                    <div className={styles.addrText}>
                      {addr.zipCode} · {addr.address}
                    </div>
                  </div>
                </div>
              ))
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
