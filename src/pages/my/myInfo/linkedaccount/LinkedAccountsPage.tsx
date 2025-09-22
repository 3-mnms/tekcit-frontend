import React from 'react';
import LinkedAccountItem from '@/components/my/myinfo/LinkedAccountItem';
import styles from './LinkedAccountsPage.module.css';

const LinkedAccountsPage: React.FC = () => {
  const providers = ['네이버', '구글', '카카오'];

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>연결된 계정</h2>
      <div className={styles.card}>
        {providers.map((provider) => (
          <LinkedAccountItem
            key={provider}
            provider={provider}
            onClick={() => alert(`${provider} 계정 연결 시도`)} // 추후 로직 연결 가능
          />
        ))}
      </div>
    </section>
  );
};

export default LinkedAccountsPage;
