// src/components/payment/pay/TekcitPay.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import Button from '@components/common/button/Button'
import AlertModal from '@/components/common/modal/AlertModal'
import styles from './TekcitPay.module.css'

import { getTekcitPayAccount, type TekcitPayAccountResponseDTO } from '@/shared/api/my/tekcitPay'
import { getTekcitBalance } from '@/shared/api/payment/tekcit'

const TEKCITPAY_JOIN_PATH = '/payment/wallet/join'

interface TekcitPayProps {
  isOpen: boolean
  onToggle: () => void
  dueAmount?: number
}

// 응답 스키마 검증
const AccountSchema: z.ZodType<TekcitPayAccountResponseDTO> = z.object({
  availableBalance: z.number(),
  updatedAt: z.string(),
})

const TekcitPay: React.FC<TekcitPayProps> = ({ isOpen, dueAmount = 0 }) => {
  const navigate = useNavigate()
  const [balance, setBalance] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showNoAccountAlert, setShowNoAccountAlert] = useState(false) // 계정 없음 모달

  const loadingRef = useRef(false)
  const lastSyncAtRef = useRef(0)

  // 계정 유무 확인
  const { data: accountInfo, isFetching, isError } = useQuery({
    queryKey: ['tekcitpay-account', isOpen],
    queryFn: async () => {
      try {
        const raw = await getTekcitPayAccount()
        const parsed = AccountSchema.parse(raw)
        return { exists: true as const, balance: parsed.availableBalance }
      } catch (e: any) {
        const code = e?.response?.data?.errorCode
        if (code === 'NOT_FOUND_TEKCIT_PAY_ACCOUNT') {
          return { exists: false as const, balance: 0 }
        }
        throw e
      }
    },
    enabled: isOpen,
    staleTime: 60_000,
  })

  // 잔액 동기화
  const sync = async () => {
    const now = Date.now()
    if (loadingRef.current) return
    if (now - lastSyncAtRef.current < 1000) return
    if (accountInfo && accountInfo.exists === false) return // 계정 없으면 동기화 안함

    loadingRef.current = true
    setError(null)
    try {
      const v = await getTekcitBalance()
      setBalance(Number.isFinite(v) ? v : 0)
    } catch (e) {
      console.error('[TekcitPay.sync] 잔액 조회 실패:', e)
      setError('잔액을 불러오지 못했어요')
    } finally {
      lastSyncAtRef.current = Date.now()
      loadingRef.current = false
    }
  }

  // 최초/포커스/가시성 변화 시 동기화
  useEffect(() => {
    sync()
    const onFocus = () => sync()
    const onVisible = () => document.visibilityState === 'visible' && sync()
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isOpen) sync()
    if (isOpen && accountInfo?.exists === false) {
      setShowNoAccountAlert(true) // 계정 없으면 모달 오픈
    }
  }, [isOpen, accountInfo])

  useEffect(() => {
    if (accountInfo?.exists && typeof accountInfo.balance === 'number') {
      setBalance(accountInfo.balance)
    }
  }, [accountInfo])

  const shortage = useMemo(
    () => Math.max(0, dueAmount - (balance ?? 0)),
    [dueAmount, balance]
  )

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.body} ${isOpen ? styles.open : ''}`}>
        {isFetching && <p className={styles.muted}>계정 정보를 불러오는 중…</p>}
        {isError && <p className={styles.error}>계정/잔액 조회 중 오류가 발생했습니다.</p>}

        {accountInfo?.exists && (
          <>
            {error && <p className={styles.error}>{error}</p>}
            {balance === null && !error && (
              <p className={styles.muted}>잔액을 불러오는 중…</p>
            )}

            {balance !== null && (
              <>
                <div className={styles.row}>
                  <span className={styles.label}>보유 잔액</span>
                  <span className={styles.value}>{balance.toLocaleString()}원</span>
                </div>

                {shortage > 0 && (
                  <div className={styles.shortageBox}>
                    <span className={styles.warningIcon}>⚠</span>
                    <p>
                      결제를 진행하려면 <strong>{shortage.toLocaleString()}원</strong>이 더 필요합니다.
                    </p>
                  </div>
                )}

                {shortage > 0 && (
                  <div className={styles.actions}>
                    <Button
                      className={styles.chargeBtn}
                      onClick={() => navigate('/payment/wallet-point/money-charge')}
                    >
                      충전하기
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* 계정 없음 알림 모달 */}
      {showNoAccountAlert && (
        <AlertModal
          title="알림"
          hideCancel
          onConfirm={() => {
            setShowNoAccountAlert(false)
            navigate(TEKCITPAY_JOIN_PATH, {
              state: { returnTo: window.location.pathname + window.location.search },
            })
          }}
        >
          테킷 페이 계정 생성이 안되어있습니다.
        </AlertModal>
      )}
    </div>
  )
}

export default TekcitPay
