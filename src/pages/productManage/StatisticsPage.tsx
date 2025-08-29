import React, {useState } from 'react';
import Layout from '@components/layout/Layout';
import { useQuery } from '@tanstack/react-query';
import { getStatsData, getProducts, getFestivalSchedules  } from '@/shared/api/admin/festival'; 
import StatisticsContent from '@/components/operatManage/statistics/StatisticsSection';
import EntranceCount from '@/components/operatManage/statistics/EntranceCount'; 
import styles from './StatisticsPage.module.css';

type TabType = '통계' | '입장 인원 수 조회';

const StatisticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('통계');
  const [selectedFid, setSelectedFid] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  
  const { data: festivals } = useQuery({
    queryKey: ['festivals'],
    queryFn: getProducts,
    select: (response) => response.data || [],
  });

  const { data: schedules } = useQuery({
    queryKey: ['schedules', selectedFid],
    queryFn: () => getFestivalSchedules(selectedFid!),
    enabled: !!selectedFid,
  });

  const { data: statsData, isLoading, isError } = useQuery({
    queryKey: ['statsData', selectedFid, selectedSchedule],
    queryFn: () => getStatsData(selectedFid, selectedSchedule),
    enabled: !!selectedFid && !!selectedSchedule, // 삐약! 🐥 두 값이 있을 때만 쿼리 실행
  });

  const handleFestivalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFid(e.target.value);
  };

  const handleScheduleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSchedule(e.target.value);
  };

  if (isLoading || isError) {
    return (
      <Layout subTitle="통계 조회">
        <div>{isLoading ? '통계 데이터를 불러오는 중...' : '통계 데이터 로딩 실패!'}</div>
      </Layout>
    );
  }

  return (
    <Layout subTitle="통계 조회">
      <div className={styles.topBar}>
        <div className={styles.tabs}>
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
        <div className={styles.dropdowns}>
          <select value={selectedFid || ''} onChange={handleFestivalChange}>
            <option value="">공연 선택</option>
            {festivals?.map(f => (
                <option key={f.fid} value={f.fid}>{f.fname}</option>
            ))}
          </select>
          <select value={selectedSchedule || ''} onChange={handleScheduleChange} disabled={!selectedFid || !schedules || schedules.data.length === 0}>
            <option value="">날짜 및 시간 선택</option>
            {schedules?.data.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      {activeTab === '통계' && statsData && (
        <StatisticsContent
          data={statsData}
          isLoading={isLoading}
          isError={isError}
        />
      )}
      {activeTab === '입장 인원 수 조회' && statsData && (
        <EntranceCount

          count={statsData.ticketCount} 
          totalCount={statsData.totalCapacity} 
          title={statsData.fname}
        />
      )}
    </Layout>
  );
};

export default StatisticsPage;