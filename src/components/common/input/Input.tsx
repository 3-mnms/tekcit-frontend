import React, { useState } from 'react'
import styles from './Input.module.css'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'

interface FormInputProps {
  type?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  label?: string
  options?: string[]
  disabled?: boolean
  className?: string
  rightElement?: React.ReactNode
}

const Input: React.FC<FormInputProps> = ({
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  label,
  options,
  disabled = false,
  className = '',
  rightElement,
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPasswordField = type === 'password'

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const renderRightElement = () => {
    if (rightElement) return rightElement

    if (isPasswordField) {
      const Icon = showPassword ? FaEye : FaEyeSlash
      return (
        <Icon
          className={styles.eyeIcon}
          onClick={togglePasswordVisibility}
        />
      )
    }

    return null
  }

  const inputType = isPasswordField ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={styles.field}>
      {label && <label className={styles.label}>{label}</label>}

      {type === 'select' && options ? (
        <select
          defaultValue={defaultValue}
          onChange={onChange}
          className={`${styles.input} ${className}`}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <div className={styles.row}>
          <input
            type={inputType}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            disabled={disabled}
            className={`${styles.input} ${className}`}
          />
          {renderRightElement()}
        </div>
      )}
    </div>
  )
}

export default Input
