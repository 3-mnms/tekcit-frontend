import React from 'react'
import type { InputHTMLAttributes } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'
import styles from './LoginInput.module.css'

interface Field extends InputHTMLAttributes<HTMLInputElement> {
  name: 'loginId' | 'loginPw'
  label?: string
  error?: string
  register?: UseFormRegisterReturn
  togglePassword?: boolean
}

interface LoginInputProps {
  inputs: Field[]
}

const LoginInput: React.FC<LoginInputProps> = ({ inputs }) => {
  const [show, setShow] = React.useState<Record<string, boolean>>({})

  return (
    <div className={styles.container}>
      {inputs.map(({ name, label, error, register, type = 'text', togglePassword, ...rest }) => {
        const isPassword = type === 'password'
        const allowToggle = isPassword && (togglePassword ?? true)
        const inputType = allowToggle && show[name] ? 'text' : type

        return (
          <div key={name} className={styles.field}>
            {label && (
              <label className={styles.label} htmlFor={name}>
                {label}
              </label>
            )}

            <div className={styles.inputWrap}>
              <input
                id={name}
                type={inputType}
                className={`${styles.input} ${error ? styles.invalid : ''}`}
                {...register}
                {...rest}
              />

              {allowToggle && (
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShow((s) => ({ ...s, [name]: !s[name] }))}
                  aria-label={show[name] ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {show[name] ? (
                    <FaEye className={styles.eyeIcon} />
                  ) : (
                    <FaEyeSlash className={styles.eyeIcon} />
                  )}
                </button>
              )}
            </div>

            {error && <p className={styles.error}>{error}</p>}
          </div>
        )
      })}
    </div>
  )
}

export default LoginInput
