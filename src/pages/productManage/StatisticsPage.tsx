import React from 'react';
import Layout from '@components/layout/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './StatisticsPage.module.css';

const StatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  return (
    <Layout subTitle="공지사항 목록"> 
      <div className={styles.container}>
        <h1 className={styles.title}>삐약! 통계 조회</h1>
        <p>상품 ID: {id}에 대한 통계 정보가 여기에 표시될 예정입니다.</p>
        <p>희수언니가 만들어주면 가져오겟쓥니다..춍춍춍 🐤</p>
        <button onClick={() => navigate(-1)}>뒤로가기</button>
      </div>
      <div style={{ padding: '24px' }}>
        
      </div>
    </Layout>
  );
};

export default StatisticsPage;