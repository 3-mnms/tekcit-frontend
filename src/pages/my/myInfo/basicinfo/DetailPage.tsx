import React from 'react'
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/button/Button'
import DetailInfoField from '@/components/my/myinfo/DetailInfoField';
import styles from './DetailPage.module.css'

const DetailPage: React.FC = () => {
  const navigate = useNavigate();

  const userInfo = {
    name: '홍길동',
    birth: '2025.07.28',
    gender: '여성',
    email: 'a@example.com',
  }

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>기본정보</h2>
      <div className={styles.card}>
        <DetailInfoField label="이름" value={userInfo.name} />
        <DetailInfoField label="생년월일" value={userInfo.birth} />
        <DetailInfoField label="성별" value={userInfo.gender} />
        <DetailInfoField label="이메일" value={userInfo.email} />

        <div className={styles.buttonWrapper}>
          <Button className={styles.button} onClick={() => navigate('../verifypassword')}>정보 수정</Button>
        </div>
      </div>
    </section>
  )
}

export default DetailPage
