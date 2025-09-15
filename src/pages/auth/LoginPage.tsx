// pages/auth/LoginPage.tsx
import React from 'react'
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
import { useLoginMutation } from '@/models/auth/tanstack-query/useLogin'
import { useAuthStore } from '@/shared/storage/useAuthStore'
import { getAndSaveFcmToken } from '@/shared/api/auth/fcrmToken'
import Spinner from '@/components/common/spinner/Spinner'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const isPopup = !!window.opener
  const { setAccessToken } = useAuthStore.getState()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  })

  const loginMut = useLoginMutation()

  const onSubmit = (form: LoginForm) => {
    loginMut.mutate(form, {
      onSuccess: async (data) => {
        if (data.accessToken) {
          setAccessToken(data.accessToken)
        }
        void getAndSaveFcmToken()
        const token = await getAndSaveFcmToken()
        console.log('fcm token:', token)

        // alert('로그인이 완료되었습니다!')
        navigate('/')
      },
      onError: (e) => {
        const msg =
          e.response?.data?.errorMessage ??
          e.response?.data?.message ??
          '아이디 또는 비밀번호를 확인하세요.'
        alert(msg)
      },
    })
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
          {loginMut.isPending && <Spinner />}
          <Button
            className="w-full h-12 mt-2"
            type="submit"
            disabled={!isValid || loginMut.isPending}
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
