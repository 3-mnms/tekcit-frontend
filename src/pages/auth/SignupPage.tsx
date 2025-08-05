import React from 'react'
import Logo from '@assets/logo.png'
import Button from '@/components/common/button/Button'
import SignupInputField from '@/components/auth/signup/SignupInputFields'
import {
  FaUser,
  FaLock,
  FaHouse,
  FaLocationDot,
  FaEnvelope,
  FaShieldHalved,
} from 'react-icons/fa6'
import styles from './SignupPage.module.css'

const SignupPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img src={Logo} alt="tekcit logo" className={styles.logo} />
        <h2 className={styles.title}>회원가입</h2>

        <SignupInputField icon={<FaUser />} placeholder="아이디" hasButton buttonText="중복 확인" />
        <SignupInputField icon={<FaLock />} placeholder="비밀번호" type="password" />
        <SignupInputField icon={<FaLock />} placeholder="비밀번호 확인" type="password" />
        <SignupInputField icon={<FaHouse />} placeholder="주소" hasButton buttonText="주소 찾기" />
        <SignupInputField icon={<FaLocationDot />} placeholder="상세주소 입력" />
        <SignupInputField
          icon={<FaEnvelope />}
          placeholder="이메일 입력"
          hasButton
          buttonText="인증하기"
        />
        {/* ✅ 인증 코드 입력 + 버튼 */}
        <SignupInputField
          icon={<FaShieldHalved />}
          placeholder="인증 코드 입력"
          hasButton
          buttonText="인증 확인"
        />

        <Button className="w-full h-12 mt-4">가입하기</Button>
      </div>
    </div>
  )
}

export default SignupPage
