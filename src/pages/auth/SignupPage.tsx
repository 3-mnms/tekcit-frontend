import React, { useState } from 'react'
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
  FaPhone,
  FaIdCard,
} from 'react-icons/fa6'
import styles from './SignupPage.module.css'
import AddressSearchModal from '@/components/auth/signup/AddressSearchModal'

const SignupPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  const [zonecode, setZonecode] = useState('')
  const [address, setAddress] = useState('')

  const handleAddressComplete = (data: { zonecode: string; address: string }) => {
    setZonecode(data.zonecode)
    setAddress(data.address)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img src={Logo} alt="tekcit logo" className={styles.logo} />
        <h2 className={styles.title}>회원가입</h2>

        <SignupInputField icon={<FaUser />} placeholder="아이디" hasButton buttonText="중복 확인" />
        <SignupInputField icon={<FaLock />} placeholder="비밀번호" type="password" />
        <SignupInputField icon={<FaLock />} placeholder="비밀번호 확인" type="password" />
        <SignupInputField icon={<FaUser />} placeholder="이름" />
        <SignupInputField icon={<FaPhone />} placeholder="전화번호" />

        <div className={styles.rrnRow}>
          <SignupInputField icon={<FaIdCard />} placeholder="주민번호 앞자리" />
          <span className={styles.hyphen}>-</span>
          <SignupInputField icon={<FaIdCard />} placeholder="뒷자리 첫글자" type="password" />
        </div>

        <SignupInputField
          icon={<FaLocationDot />}
          placeholder="우편번호"
          hasButton
          buttonText="주소 찾기"
          value={zonecode}
          onChange={(e) => setAddress(e.target.value)}
          onButtonClick={() => setShowModal(true)}
        />
        <SignupInputField
          icon={<FaHouse />}
          placeholder="주소"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <SignupInputField icon={<FaLocationDot />} placeholder="상세주소 입력" />

        {showModal && (
          <AddressSearchModal
            onClose={() => setShowModal(false)}
            onComplete={handleAddressComplete}
          />
        )}

        <SignupInputField
          icon={<FaEnvelope />}
          placeholder="이메일 입력"
          hasButton
          buttonText="인증하기"
        />
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
