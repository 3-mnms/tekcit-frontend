import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/my/sidebar/Sidebar';
import Header from '@/components/common/header/Header';
import styles from './MyPage.module.css';

const MyPage: React.FC = () => {
  return (
    <div className={styles.pageWrapper}>
      <Header /> 
      <div className={styles.wrapper}>
        <Sidebar />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MyPage;