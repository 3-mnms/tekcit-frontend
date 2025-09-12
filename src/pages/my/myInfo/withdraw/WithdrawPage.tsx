import React, { useState } from 'react'
import Button from '@/components/common/button/Button'
import styles from './WithdrawPage.module.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useDeleteAccountMutation } from '@/models/auth/tanstack-query/useDeleteAccount'
import { useAuthStore } from '@/shared/storage/useAuthStore'

import { FaExclamationTriangle, FaUserTimes, FaShieldAlt } from 'react-icons/fa'

const WithdrawPage: React.FC = () => {
  const [checked, setChecked] = useState(false)
  const navigate = useNavigate()
  const delMut = useDeleteAccountMutation()
  const logout = useAuthStore((s) => s.logout)

  const handleWithdraw = () => {
    if (!checked || delMut.isPending) return
    if (!window.confirm('정말 탈퇴하시겠어요? 이 작업은 되돌릴 수 없습니다.')) return

    delMut.mutate(undefined, {
      onSuccess: () => {
        logout()
        alert('회원 탈퇴 처리되었습니다.')
        navigate('/login', { replace: true })
      },
      onError: (err) => {
        const msg = axios.isAxiosError(err)
          ? (err.response?.data as any)?.message || (err.response?.data as any)?.errorMessage
          : null
        alert(`❌ ${msg || '탈퇴 처리에 실패했어요. 다시 시도해주세요.'}`)
      },
    })
  }

  return (
    <section className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <h2 className={styles.title}>회원 탈퇴</h2>
      </div>

      {/* 주의사항 카드 */}
      <div className={`${styles.card} ${styles.warningCard}`}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <FaExclamationTriangle className={styles.titleIcon} aria-hidden />
            <span>탈퇴 시 주의사항</span>
          </div>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.bulletBox}>
            <div className={styles.bulletRow}>
              <span className={styles.dot} aria-hidden />
              <p className={styles.bulletText}>탈퇴 시 모든 계정 정보가 삭제되며 복구가 불가능합니다.</p>
            </div>
            <div className={styles.bulletRow}>
              <span className={styles.dot} aria-hidden />
              <p className={styles.bulletText}>보유한 티켓 및 예매 정보 또한 함께 삭제됩니다.</p>
            </div>
            <div className={styles.bulletRow}>
              <span className={styles.dot} aria-hidden />
              <p className={styles.bulletText}>
                탈퇴 후 90일 이내에는 동일한 이메일로 재가입이 가능하지만, 이후에는 제한될 수 있습니다.
              </p>
            </div>
          </div>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={checked}
              onChange={() => setChecked((v) => !v)}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>위 사항을 모두 확인했습니다.</span>
          </label>
        </div>
      </div>

      <Button
        className={`${styles.withdrawButton} ${checked && !delMut.isPending ? styles.withdrawButtonActive : ''}`}
        onClick={handleWithdraw}
        disabled={!checked || delMut.isPending}
      >
        {delMut.isPending ? '탈퇴 처리 중…' : '탈퇴하기'}
      </Button>
    </section>
  )
}

export default WithdrawPage
