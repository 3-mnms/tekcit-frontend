import React, { useMemo, useState } from 'react'
import Button from '@/components/common/button/Button'
import AuthCard from '@/components/auth/find/AuthCard'
import styles from '@/components/auth/find/AuthForm.module.css'
import { useNavigate, useLocation } from 'react-router-dom'
import { patchResetPasswordWithEmail } from '@/shared/api/auth/find'
import axios from 'axios'
import { z } from 'zod'
import Spinner from '@/components/common/spinner/Spinner'

type LocationState = { loginId?: string; email?: string }

const passwordRule = z
  .string()
  .trim()
  .refine(
    (val) =>
      val.length >= 8 &&
      val.length <= 20 &&
      /[A-Za-z]/.test(val) &&
      /[0-9]/.test(val) &&
      /[^A-Za-z0-9]/.test(val),
    { message: '8~20자의 영문/숫자/특수문자를 모두 포함해야 합니다.' },
  )

type ApiErrPayload = { message?: string; errorMessage?: string }

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const { state } = useLocation() as { state?: LocationState }

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const passwordError = useMemo(() => {
    if (!password) return null
    const r = passwordRule.safeParse(password)
    return r.success ? null : r.error.errors[0]?.message ?? '비밀번호 형식이 올바르지 않습니다.'
  }, [password])

  const confirmError = useMemo(() => {
    if (!confirmPassword) return null
    if (password !== confirmPassword) return '비밀번호가 일치하지 않습니다.'
    return null
  }, [password, confirmPassword])

  const canSubmit =
    Boolean(password) &&
    Boolean(confirmPassword) &&
    !passwordError &&
    !confirmError &&
    Boolean(state?.loginId) &&
    Boolean(state?.email) &&
    !pending

  const handleReset = async () => {
    if (!state?.loginId || !state?.email) {
      alert('인증 정보가 없습니다. 비밀번호 찾기부터 진행해주세요.')
      return
    }

    const ruleCheck = passwordRule.safeParse(password)
    if (!ruleCheck.success) {
      setErrorMsg(ruleCheck.error.errors[0]?.message ?? '비밀번호 형식이 올바르지 않습니다.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('비밀번호가 일치하지 않습니다.')
      return
    }

    setPending(true)
    setErrorMsg(null)
    try {
      await patchResetPasswordWithEmail({
        loginId: state.loginId,
        email: state.email,
        loginPw: password.trim(),
      })
      alert('비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다.')
      navigate('/login')
    } catch (err) {
      const msg =
        axios.isAxiosError(err)
          ? ((err.response?.data as ApiErrPayload | undefined)?.message ??
             (err.response?.data as ApiErrPayload | undefined)?.errorMessage)
          : undefined
      setErrorMsg(msg ?? '비밀번호 변경에 실패했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthCard title="비밀번호 재설정">
      <input
        type="password"
        placeholder="새 비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles.input}
        aria-invalid={Boolean(passwordError)}
      />
      {passwordError && <p className={styles.error}>{passwordError}</p>}

      <input
        type="password"
        placeholder="새 비밀번호 확인"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className={styles.input}
        aria-invalid={Boolean(confirmError)}
      />
      {confirmError && <p className={styles.error}>{confirmError}</p>}

      {errorMsg && <p className={styles.error}>{errorMsg}</p>}
      {pending && <Spinner />}
      <div className={styles.actions}>
        <Button onClick={handleReset} className="w-full h-11" disabled={!canSubmit}>
          비밀번호 변경
        </Button>
      </div>
    </AuthCard>
  )
}

export default ResetPasswordPage
