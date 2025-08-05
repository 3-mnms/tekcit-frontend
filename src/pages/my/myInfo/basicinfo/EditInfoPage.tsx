import React from 'react';
import Button from '@/components/common/button/Button';
import Input from '@/components/common/input/Input';
import styles from './EditInfoPage.module.css';

const EditInfoPage: React.FC = () => {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>정보 수정</h2>

      <Input label="이름" defaultValue="홍길동" />
      <Input label="생년월일" type="date" defaultValue="2025-07-28" />
      <Input label="성별" type="select" defaultValue="여성" options={['여성', '남성', '기타']} />
      <Input
        label="이메일"
        value="a@example.com"
        disabled
        rightElement={<Button className={styles.emailButton}>이메일 변경</Button>}
      />

      <Button className={styles.submitButton}>수정 완료</Button>
    </section>
  );
};

export default EditInfoPage;