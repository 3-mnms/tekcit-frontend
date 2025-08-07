import React from 'react'
import { Link } from 'react-router-dom' // 이거 꼭 추가해야 해!
import Logo from '@assets/logo.png'
import LoginInput from '@/components/auth/login/LoginInput'
import SocialLogin from '@/components/auth/login/SocialLogin'
import Button from '@/components/common/button/Button'
import styles from './LoginPage.module.css'

const LoginPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img src={Logo} alt="tekcit logo" className={styles.logo} />

        <LoginInput
          inputs={[
            { type: 'text', placeholder: '아이디' },
            { type: 'password', placeholder: '비밀번호' },
          ]}
        />

        <Button className="w-full h-12">로그인</Button>

        <div className={styles.findLinks}>
          <Link to="/find-id">아이디 찾기</Link> | <Link to="/find-password">비번 찾기</Link>
        </div>

        <SocialLogin />

        <div className={styles.divider} />
        <p className={styles.notMemberText}>아직 회원이 아니신가요?</p>

        <Button className="w-full h-12">회원가입 하기</Button>
      </div>
    </div>
  )
}

export default LoginPage