import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/my/sidebar/Sidebar';
import styles from './MyPage.module.css';

const MyPage: React.FC = () => {
  return (
    <div className={styles.wrapper}>
      <Sidebar />
      <main className={styles.content}>
        <Outlet /> 
      </main>
    </div>
  );
};

export default MyPage;
