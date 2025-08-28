// src/components/operatManage/statistics/StatisticsContent.tsx

import React from 'react';
import styles from './StatisticsSection.module.css'; // 삐약! 🐥 기존 스타일을 그대로 사용해요.
import TicketProgressGraph from '@/components/operatManage/statistics/TicketProgressGraph';
import Statistics from '@/components/festival/detail/FestivalStatisticsSection';
import { getStatsData } from '@/shared/api/admin/festival'; 
import { useQuery } from '@tanstack/react-query';

const StatisticsContent: React.FC = () => {
    const { data, isLoading, isError } = useQuery({
    queryKey: ['statsData'],
    queryFn: getStatsData, // 예시 API 함수
  });
  if (isLoading) {
    return <div>통계 데이터를 불러오는 중...</div>;
  }
  if (isError || !data) {
    return <div>통계 데이터 로딩 실패!</div>;
  }

  return (
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
  );
};

export default StatisticsContent;