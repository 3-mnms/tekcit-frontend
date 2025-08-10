// src/components/payment/pay/CardSimplePayment.tsx
import React from 'react'
import styles from './CardSimplePayment.module.css'
import type { SimpleMethod } from '@/shared/types/payment'

interface CardSimplePaymentProps {
  isOpen?: boolean
  onToggle?: () => void
  onSelect: (method: SimpleMethod) => void
  compact?: boolean
  // 선택 표시가 필요하면 나중에 selected를 넘겨도 됨
  selected?: SimpleMethod | null
}

const CardSimplePayment: React.FC<CardSimplePaymentProps> = ({
  isOpen = false,
  onToggle,
  onSelect,
  compact = false,
  selected = null,
}) => {
  return (
    // ✅ 라디오 스타일이 이 래퍼에 스코프되어 있음 (.payment-section input[type='radio'])
    <div className={styles['payment-section']}>
      {/* 헤더/토글 */}
      <label className={styles['simple-payment-option']}>
        <input type="radio" name="payment-method" checked={isOpen} onChange={onToggle} />
        <span className={styles['radio-label']}>간편결제</span>
      </label>

      {/* 본문: 버튼 박스 */}
      {isOpen && (
        <div className={styles['payment-box']}>
          <div className={styles['payment-buttons-row']}>
            <button
              type="button"
              className={styles['payment-btn']}
              data-variant="네이버페이"
              data-selected={selected === '네이버페이'}
              onClick={() => onSelect('네이버페이')}
            >
              <span className={styles['btn-icon']}>N</span>
              <span className={styles['btn-text']}>네이버페이</span>
            </button>

            <button
              type="button"
              className={styles['payment-btn']}
              data-variant="카카오페이"
              data-selected={selected === '카카오페이'}
              onClick={() => onSelect('카카오페이')}
            >
              <span className={styles['btn-icon']}>K</span>
              <span className={styles['btn-text']}>카카오페이</span>
            </button>

            <button
              type="button"
              className={styles['payment-btn']}
              data-variant="토스페이"
              data-selected={selected === '토스페이'}
              onClick={() => onSelect('토스페이')}
            >
              <span className={styles['btn-icon']}>T</span>
              <span className={styles['btn-text']}>토스페이</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CardSimplePayment
