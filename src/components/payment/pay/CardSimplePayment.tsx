// src/components/payment/pay/CardSimplePayment.tsx
import React from 'react'
import styles from './CardSimplePayment.module.css'
import type { SimpleMethod } from '@/shared/types/payment'

interface CardSimplePaymentProps {
  isOpen?: boolean
  onToggle?: () => void
  onSelect: (method: SimpleMethod) => void
  compact?: boolean
  selected?: SimpleMethod | null
  methods?: SimpleMethod[] // ✅ 추가: 보여줄 간편결제 목록 제어
}

const ALL_METHODS: SimpleMethod[] = ['네이버페이', '카카오페이', '토스페이']

const CardSimplePayment: React.FC<CardSimplePaymentProps> = ({
  isOpen = false,
  onToggle,
  onSelect,
  compact = false,
  selected = null,
  methods = ALL_METHODS,
}) => {
  // ✅ compact 모드: 버튼만 보여줌
  if (compact) {
    return (
      <div className={styles['payment-box']}>
        <div className={styles['payment-buttons-row']}>
          {methods.map((m) => (
            <button
              key={m}
              type="button"
              className={styles['payment-btn']}
              data-variant={m}
              data-selected={selected === m}
              onClick={() => onSelect(m)}
            >
              <span className={styles['btn-icon']}>
                {m === '네이버페이' ? 'N' : m === '카카오페이' ? 'K' : 'T'}
              </span>
              <span className={styles['btn-text']}>{m}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ✅ 기본(토글) 모드
  return (
    <div className={styles['payment-section']}>
      <label className={styles['simple-payment-option']}>
        <input type="radio" name="payment-method" checked={isOpen} onChange={onToggle} />
        <span className={styles['radio-label']}>간편결제</span>
      </label>

      {isOpen && (
        <div className={styles['payment-box']}>
          <div className={styles['payment-buttons-row']}>
            {methods.map((m) => (
              <button
                key={m}
                type="button"
                className={styles['payment-btn']}
                data-variant={m}
                data-selected={selected === m}
                onClick={() => onSelect(m)}
              >
                <span className={styles['btn-icon']}>
                  {m === '네이버페이' ? 'N' : m === '카카오페이' ? 'K' : 'T'}
                </span>
                <span className={styles['btn-text']}>{m}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CardSimplePayment
export type { SimpleMethod } // ← 선택: 재노출 원하면 유지, 아니면 제거하고 사용처를 shared로 통일 멍
