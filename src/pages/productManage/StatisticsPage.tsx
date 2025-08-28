import React from 'react';
import Layout from '@components/layout/Layout';
// import { useNavigate, useParams } from 'react-router-dom';
import styles from './StatisticsPage.module.css';
import TicketProgressGraph from '@/components/operatManage/statistics/TicketProgressGraph';
import Statistics from '@/components/festival/detail/FestivalStatisticsSection';
import { useQuery } from '@tanstack/react-query';

import { getStatsData } from '@/shared/api/admin/festival'; 

const StatisticsPage: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['statsData'],
    queryFn: getStatsData, // 예시 API 함수
  });

  if (isLoading) return <div>통계 데이터를 불러오는 중...</div>;
  if (isError || !data) return <div>통계 데이터 로딩 실패!</div>;

  return (
    <Layout subTitle="통계 조회">
      <div className={styles.container}>
        <div className={styles.controls}> 
          <TicketProgressGraph 
            currentTickets={data.ticketCount} 
            totalCapacity={data.totalCapacity} 
            />
        </div>  
        <div className={styles.statsSection}>  
          <Statistics/>
        </div>
      </div>
    </Layout>
  );
};

export default StatisticsPage;