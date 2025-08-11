// src/components/payment/pay/WalletPayment.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@components/common/button/Button'
import styles from './WalletPayment.module.css'
import { getWalletBalance } from '@/shared/api/payment/wallet' // ✅ 추가 멍

interface WalletPaymentProps {
  isOpen: boolean
  onToggle: () => void
}

const WalletPayment: React.FC<WalletPaymentProps> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate()

  // ✅ 잔액 상태 멍
  const [balance, setBalance] = useState(0)

  // ✅ 공통 동기화 함수 멍
  const sync = async () => {
    const v = await getWalletBalance()
    setBalance(v)
  }

  // ✅ 최초 마운트 + 포커스/가시성 변경 시 갱신 멍
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
  }, [])

  // ✅ 열릴 때마다 한 번 더 동기화(충전 후 돌아왔을 때 대비) 멍
  useEffect(() => {
    if (isOpen) sync()
  }, [isOpen])

  const handleChargeClick = () => {
    navigate('/payment/wallet-point/money-charge')
  }

  return (
    <div className={styles['wallet-payment-container']}>
      <div className={styles['main-content']}>
        <div className={styles['payment-section']}>
          {/* 헤더 멍 */}
          <div className={styles['payment-header']}>
            <label className={styles['simple-payment-option']}>
              <input
                type="radio"
                name="payment-method"
                checked={isOpen}
                onChange={onToggle}
                aria-label="킷페이 결제 선택"
              />
              <span className={styles['radio-label']}>킷페이</span>
            </label>

            {isOpen && <Button onClick={handleChargeClick}>충전하기</Button>}
          </div>

          {/* 슬라이드 영역 멍 */}
          <div className={`${styles['slide-toggle']} ${isOpen ? styles['open'] : ''}`}>
            <div className={styles['charge-section']}>
              <div className={styles['charge-input-group']}>
                <label className={styles['charge-label']}>충전</label>
                <div className={styles['charge-options']}>
                  <div className={styles['amount-selector']}>
                    {/* ✅ 지갑 잔액 표시 멍 */}
                    <span className={styles['amount']}>{balance.toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* // 슬라이드 영역 */}
        </div>
      </div>
    </div>
  )
}

export default WalletPayment
