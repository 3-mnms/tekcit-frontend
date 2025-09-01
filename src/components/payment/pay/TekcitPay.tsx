// 주석: TekcitPay.tsx — 중복 호출 방지/로그 추가 멍
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@components/common/button/Button'
import styles from './TekcitPay.module.css'
import { getTekcitBalance } from '@/shared/api/payment/tekcit'

interface TekcitPayProps {
  isOpen: boolean
  onToggle: () => void
  dueAmount?: number
}

const TekcitPay: React.FC<TekcitPayProps> = ({ isOpen, dueAmount = 0 }) => {
  const navigate = useNavigate()
  const [balance, setBalance] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 주석: 연속 호출 방지용 플래그/타임스탬프 멍
  const loadingRef = useRef(false)
  const lastSyncAtRef = useRef(0)

  // 주석: 500ms 디바운스 + 1초 쿨다운 멍
  const sync = async () => {
    const now = Date.now()
    if (loadingRef.current) return
    if (now - lastSyncAtRef.current < 1000) return // 주석: 너무 잦은 호출 방지 멍

    loadingRef.current = true
    setError(null)
    try {
      const v = await getTekcitBalance()
      setBalance(Number.isFinite(v) ? v : 0)
    } catch (e) {
      console.error('[TekcitPay.sync] 잔액 조회 실패:', e) // 주석: 원인 추적 로그 멍
      setError('잔액을 불러오지 못했어요')
    } finally {
      lastSyncAtRef.current = Date.now()
      loadingRef.current = false
    }
  }

  useEffect(() => {
    sync()

    // 주석: 포커스/가시성 이벤트에서만 추가 동기화 멍
    const onFocus = () => sync()
    const onVisible = () => document.visibilityState === 'visible' && sync()
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  useEffect(() => {
    if (isOpen) sync() // 주석: 섹션 열릴 때만 동기화 멍
  }, [isOpen])

  const shortage = useMemo(
    () => Math.max(0, dueAmount - (balance ?? 0)),
    [dueAmount, balance]
  )

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.body} ${isOpen ? styles.open : ''}`}>
        {error && <p className={styles.error}>{error}</p>}
        {balance === null && !error && <p className={styles.muted}>잔액을 불러오는 중…</p>}

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
      </div>
    </div>
  )
}

export default TekcitPay
