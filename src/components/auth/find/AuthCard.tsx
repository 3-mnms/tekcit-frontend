import React from 'react';
import Logo from '@assets/logo.png';
import styles from './AuthCard.module.css';

type Props = {
  title: string;
  children: React.ReactNode;
  /** 하단 고정 영역(버튼 등) */
  fixedAction?: React.ReactNode;
};

const AuthCard: React.FC<Props> = ({ title, children, fixedAction }) => {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img src={Logo} alt="tekcit logo" className={styles.logo} />
        <h2 className={styles.title}>{title}</h2>

        <div className={styles.body}>{children}</div>

        {fixedAction && <div className={styles.actions}>{fixedAction}</div>}
      </div>
    </div>
  );
};

export default AuthCard;
