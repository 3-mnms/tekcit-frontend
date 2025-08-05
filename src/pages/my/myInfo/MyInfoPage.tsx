import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './MyInfoPage.module.css'
import MyInfoCardItem from '@/components/my/myinfo/MyInfoCardItem'

const MyInfoPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>내 정보</h2>

      <MyInfoCardItem label="사용자명(기본정보)" onClick={() => navigate('/mypage/myinfo/detail')} />

      <div className={styles.group}>
        <MyInfoCardItem label="비밀번호 변경" onClick={() => navigate('/mypage/myinfo/password')} />
        <MyInfoCardItem label="연결된 계정" onClick={() => navigate('/mypage/myinfo/account')} />
        <MyInfoCardItem label="배송지 관리" onClick={() => navigate('/mypage/myinfo/address')} />
      </div>

      <MyInfoCardItem label="회원 탈퇴" onClick={() => navigate('/mypage/myinfo/withdraw')} />
    </section>
  )
}
export default MyInfoPage
