import React, { useState } from 'react'
import Button from '@/components/common/button/Button'
import styles from './WithdrawPage.module.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useDeleteAccountMutation } from '@/models/auth/tanstack-query/useDeleteAccount'
import { tokenStore } from '@/shared/storage/tokenStore'

const WithdrawPage: React.FC = () => {
  const [checked, setChecked] = useState(false)
  const navigate = useNavigate()
  const delMut = useDeleteAccountMutation()

  const handleWithdraw = () => {
    if (!checked || delMut.isPending) return
    if (!window.confirm('정말 탈퇴하시겠어요? 이 작업은 되돌릴 수 없습니다.')) return

    delMut.mutate(undefined, {
      onSuccess: () => {
        tokenStore.clear() 
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
      <h2 className={styles.title}>회원 탈퇴</h2>

      <div className={styles.noticeBox}>
        <p className={styles.notice}>
          - 탈퇴 시 모든 계정 정보가 삭제되며 복구가 불가능합니다. <br />
          - 보유한 티켓 및 예매 정보 또한 함께 삭제됩니다. <br />- 탈퇴 후 90일 이내에는 동일한
          이메일로 재가입이 가능하지만, 이후에는 제한될 수 있습니다.
        </p>
      </div>

      <label className={styles.checkboxLabel}>
        <input type="checkbox" checked={checked} onChange={() => setChecked(!checked)} />
        <span className={styles.checkboxText}>위 사항을 모두 확인했습니다.</span>
      </label>

      <Button
        className={styles.withdrawButton}
        onClick={handleWithdraw}
        disabled={!checked || delMut.isPending}
      >
        {delMut.isPending ? '탈퇴 처리 중…' : '탈퇴하기'}
      </Button>
    </section>
  )
}

export default WithdrawPage
