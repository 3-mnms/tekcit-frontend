import React, { useState } from 'react';
import Layout from '@components/layout/Layout';
import { useQuery } from '@tanstack/react-query';
import { getStatsData } from '@/shared/api/admin/festival'; 
import StatisticsContent from '@/components/operatManage/statistics/StatisticsSection';
import EntranceCount from '@/components/operatManage/statistics/EntranceCount'; 

// import { useNavigate, useParams } from 'react-router-dom';
import styles from './StatisticsPage.module.css';

type TabType = '통계' | '입장 인원 수 조회';

const StatisticsPage: React.FC = () => {
  // 삐약! 🐥 현재 선택된 탭의 상태를 관리해요. 초기값은 '통계'로 설정해요.
  const [activeTab, setActiveTab] = useState<TabType>('통계');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['statsData'],
    queryFn: getStatsData,
  });

  return (
    <Layout subTitle="통계 조회">
      <div className={styles.tabContainer}>
        {/* 삐약! 🐥 탭 버튼들을 만들어요. */}
        <button 
          className={`${styles.tabButton} ${activeTab === '통계' ? styles.active : ''}`}
          onClick={() => setActiveTab('통계')}
        >
          통계
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === '입장 인원 수 조회' ? styles.active : ''}`}
          onClick={() => setActiveTab('입장 인원 수 조회')}
        >
          입장 인원 수 조회
        </button>
      </div>

      {/* 삐약! 🐥 activeTab 상태에 따라 다른 컴포넌트를 조건부로 렌더링해요. */}
      {activeTab === '통계' && (
        <StatisticsContent
          data={data || null}
          isLoading={isLoading}
          isError={isError}
        />
      )}
      {activeTab === '입장 인원 수 조회' && (
        // 삐약! 🐥 입장 인원 수 조회 컴포넌트를 여기에 넣으면 돼요.
        // 현재는 EntranceCount라는 가상의 컴포넌트를 사용했어요.
        <EntranceCount
          // 삐약! 🐥 데이터 필드 이름에 맞춰서 props를 전달해요.
          count={data.ticketCount} 
          totalCount={data.totalCapacity} 
          title={data.fname}
        />
      )}
    </Layout>
  );
};

export default StatisticsPage;