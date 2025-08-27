import React from 'react'
import Button from '@/components/common/button/Button'
import DetailInfoField from '@/components/my/myinfo/DetailInfoField'
import styles from './DetailPage.module.css'

const DetailPage: React.FC = () => {
  const user = {
    id: 'example123',
    name: '홍길동',
    birth: '2025.07.28',
    gender: '여성',
    phone: '010-1234-5678',
    email: 'a@example.com',
  }

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>기본정보</h2>
      <div className={styles.card}>
        <DetailInfoField label="이름" value={user.name} />
        <DetailInfoField label="생년월일" value={user.birth} />
        <DetailInfoField label="성별" value={user.gender} />
        <DetailInfoField label="전화번호" value={user.phone} />
        <div className={styles.buttonWrapper}>
          <Button className={styles.button}>정보 수정</Button>
        </div>
      </div>

      <div className={styles.card}>
      <h2 className={styles.title2}>계정정보</h2>
        <DetailInfoField label="아이디" value={user.id} />
        <DetailInfoField label="이메일" value={user.email} />
      </div>
    </section>
  )
}

export default DetailPage
