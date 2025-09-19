// pages/auth/LoginPage.tsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '@assets/logo.png'
import LoginInput from '@/components/auth/login/LoginInput'
import SocialLogin from '@/components/auth/login/SocialLogin'
import Button from '@/components/common/button/Button'
import styles from './LoginPage.module.css'
import KakaoPopupBridge from '@/components/auth/login/KakaoPopupBridge'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginForm } from '@/models/auth/schema/loginSchema'
import Spinner from '@/components/common/spinner/Spinner'

import { useAuthStore } from '@/shared/storage/useAuthStore'
import { setAuthHeaderToken } from '@/shared/config/axios'
import { getAndSaveFcmToken } from '@/shared/api/auth/fcrmToken'
import type { AxiosError } from 'axios'

import {
  login,
  confirmLogin,
  isLoginSuccess,
  isLoginConflict,
} from '@/shared/api/auth/login'

type ErrorBody = { errorMessage?: string; message?: string }

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const isPopup = !!window.opener
  const { setAccessToken } = useAuthStore.getState()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  })

  const onSubmit = async (form: LoginForm) => {
    setLoading(true)
    try {
      const res = await login(form) 

      if (isLoginSuccess(res)) {
        const accessToken = res.accessToken
        setAuthHeaderToken(accessToken)
        setAccessToken(accessToken)

        await getAndSaveFcmToken()

        navigate('/')
        return
      }

      if (isLoginConflict(res)) {
        const ok = window.confirm(
          '이미 로그인된 세션이 있습니다.\n기존 세션을 로그아웃하고 이 기기에서 로그인할까요?'
        )
        if (!ok) return

        try {
          const confirmed = await confirmLogin(res.loginTicket)
          const accessToken = confirmed.accessToken
          setAuthHeaderToken(accessToken)
          setAccessToken(accessToken)

          const token = await getAndSaveFcmToken()
          console.log('fcm token:', token)

          navigate('/')
          return
        } catch (e) {
          const err = e as AxiosError<ErrorBody>
          const msg =
            err.response?.data?.errorMessage ??
            err.response?.data?.message ??
            '로그인 확인이 만료되었거나 유효하지 않습니다. 다시 로그인해 주세요.'
          alert(msg)
          return
        }
      }

      alert('알 수 없는 로그인 응답입니다. 다시 시도해 주세요.')
    } catch (e) {
      const err = e as AxiosError<ErrorBody>
      const msg =
        err.response?.data?.errorMessage ??
        err.response?.data?.message ??
        '아이디 또는 비밀번호를 확인하세요.'
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      {isPopup && <KakaoPopupBridge status="existing" />}
      <div className={styles.card}>
        <img src={Logo} alt="tekcit logo" className={styles.logo} onClick={() => navigate('/')} />

        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <LoginInput
            inputs={[
              {
                name: 'loginId',
                type: 'text',
                placeholder: '아이디',
                register: register('loginId'),
                error: errors.loginId?.message,
              },
              {
                name: 'loginPw',
                type: 'password',
                placeholder: '비밀번호',
                register: register('loginPw'),
                error: errors.loginPw?.message,
              },
            ]}
          />

          {(loading) && <Spinner />}

          <Button
            className="w-full h-12 mt-2"
            type="submit"
            disabled={!isValid || loading}
          >
            로그인
          </Button>
        </form>

        <div className={styles.findLinks}>
          <Link to="/find-id">아이디 찾기</Link> | <Link to="/find-password">비밀번호 찾기</Link>
        </div>

        <SocialLogin />

        <div className={styles.divider} />
        <p className={styles.notMemberText}>아직 회원이 아니신가요?</p>

        <Link to="/auth/signup" className="w-full">
          <Button className="w-full h-12">회원가입 하기</Button>
        </Link>
      </div>
    </div>
  )
}

export default LoginPage
