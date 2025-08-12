import React, { useState, forwardRef } from 'react'
import styles from './SignupInputFields.module.css'
import Button from '@/components/common/button/Button'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'

interface BaseProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode
  hasButton?: boolean
  buttonText?: string
  onButtonClick?: () => void
  buttonDisabled?: boolean
  error?: string
  touched?: boolean
}

const SignupInputField = forwardRef<HTMLInputElement, BaseProps>(
  (
    {
      icon,
      placeholder,
      hasButton = false,
      buttonText,
      onButtonClick,
      buttonDisabled = false,
      type = 'text',
      error,
      touched,
      readOnly,
      ...inputProps
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    const showError = !!error && !!touched
    const showSuccess = !!touched && !error

    return (
      <div className={`${styles.row} ${hasButton ? styles.hasButtonRow : ''}`}>
        <div
          className={[
            styles.inputWrapper,
            showError ? styles.invalid : '',
            showSuccess ? styles.valid : '',
            readOnly 
              ? '!bg-gray-100 rounded-md cursor-not-allowed border border-gray-100'
              : '',
          ].join(' ')}
        >
          <div className={`${styles.left}`}>
            {icon}
            <span className={styles.bar}>&nbsp;|</span>
          </div>

          <input
            ref={ref}
            type={inputType}
            placeholder={placeholder}
            readOnly={readOnly}
            className={`${styles.input} ${readOnly  ? 'bg-gray-100 border-none text-gray-600' : ''}`}
            aria-invalid={showError}
            aria-describedby={showError ? `${inputProps.name}-error` : undefined}
            {...inputProps}
          />

          {isPassword && (
            <button
              type="button"
              className={styles.eyeIcon}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showPassword ? (
                <FaEye className={styles.iconToggle} />
              ) : (
                <FaEyeSlash className={styles.iconToggle} />
              )}
            </button>
          )}
        </div>

        {hasButton && (
          <div className={styles.buttonWrapper}>
            <Button
              type="button"
              onClick={onButtonClick}
              disabled={buttonDisabled}
              className="w-[95px] h-[44px] text-sm"
            >
              {buttonText}
            </Button>
          </div>
        )}

        {showError && (
          <p id={`${inputProps.name}-error`} className={styles.errorText}>
            {error}
          </p>
        )}
      </div>
    )
  },
)

export default SignupInputField
