import React, { useState } from 'react'
import styles from '@components/payment/pay/CardSimplePayment.module.css'

interface CardSimplePaymentProps {
  isOpen: boolean
  onToggle: () => void
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

const CardSimplePayment: React.FC<CardSimplePaymentProps> = ({ isOpen, onToggle }) => {
  const [selectedMethod, setSelectedMethod] = useState<'네이버페이' | '카카오페이' | null>(null)

  return (
    <div className={styles['payment-section']}>
      {/* 카드 간편 결제 토글 */}
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

      {/* 슬라이드 영역 */}
      <div className={`${styles['slide-toggle']} ${isOpen ? styles.open : ''}`}>
        <div className={styles['payment-box']}>
          <div className={styles['payment-buttons-row']}>
            <Button
              className={`${styles['payment-btn']} ${styles['naver-btn']} ${
                selectedMethod === '네이버페이' ? styles.selected : ''
              }`}
              onClick={() => setSelectedMethod('네이버페이')}
            >
              <div className={`${styles['btn-icon']} ${styles['naver-icon']}`}>
                <span className="icon-text">N</span>
              </div>
              <span className={styles['btn-text']}>네이버페이</span>
            </Button>

            <Button
              className={`${styles['payment-btn']} ${styles['kakao-btn']} ${
                selectedMethod === '카카오페이' ? styles.selected : ''
              }`}
              onClick={() => setSelectedMethod('카카오페이')}
            >
              <div className={`${styles['btn-icon']} ${styles['kakao-icon']}`}>
                <span className="icon-text">K</span>
              </div>
              <span className={styles['btn-text']}>카카오페이</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardSimplePayment
