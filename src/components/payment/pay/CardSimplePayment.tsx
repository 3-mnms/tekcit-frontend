import React, { useState } from 'react'

import styles from './CardSimplePayment.module.css'

interface CardSimplePaymentProps {
  isOpen?: boolean           // 슬라이드 토글 열림 여부(선택)
  onToggle?: () => void      // 토글 클릭 시 콜백(선택)
  onSelect: (method: '네이버페이' | '카카오페이') => void
  compact?: boolean          // true면 “토글/슬라이드 없이” 버튼만!
}

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  disabled?: boolean
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
}) => {
  return (
    <button
      className={`${styles['custom-button']} ${className} ${disabled ? styles.disabled : ''}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

const CardSimplePayment: React.FC<CardSimplePaymentProps> = ({
  isOpen = true,
  onToggle,
  onSelect,
  compact = false,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'네이버페이' | '카카오페이' | null>(null)

  const handleSelect = (method: '네이버페이' | '카카오페이') => {
    setSelectedMethod(method)
    onSelect(method)
  }

  return (
    <div className={styles['payment-section']}>
      {/* “compact=false”일 때만 토글/슬라이드 보이게 */}
      {!compact && (
        <div className={styles['toggle-section']}>
          <div className={styles['toggle-row']} onClick={onToggle}>
            <div className={styles['toggle-radio']}>
              <input
                type="radio"
                checked={isOpen}
                onChange={onToggle}
                className={styles['radio-input']}
              />
              <span className={styles['radio-custom']}></span>
            </div>
            <span className={styles['toggle-label']}>카드 간편 결제</span>
          </div>
        </div>
      )}

      {/* 버튼만 모드면 바로 버튼만 노출 */}
      {(compact || isOpen) && (
        <div className={styles['payment-box']}>
          <div className={styles['payment-buttons-row']}>
            <Button
              className={`${styles['payment-btn']} ${styles['naver-btn']} ${selectedMethod === '네이버페이' ? styles.selected : ''}`}
              onClick={() => handleSelect('네이버페이')}
            >
              <div className={`${styles['btn-icon']} ${styles['naver-icon']}`}>
                <span className="icon-text">N</span>
              </div>
              <span className={styles['btn-text']}>네이버페이</span>
            </Button>
            <Button
              className={`${styles['payment-btn']} ${styles['kakao-btn']} ${selectedMethod === '카카오페이' ? styles.selected : ''}`}
              onClick={() => handleSelect('카카오페이')}
            >
              <div className={`${styles['btn-icon']} ${styles['kakao-icon']}`}>
                <span className="icon-text">K</span>
              </div>
              <span className={styles['btn-text']}>카카오페이</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CardSimplePayment
