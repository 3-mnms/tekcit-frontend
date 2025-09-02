import React, {useEffect, useMemo, useState } from 'react';
import Layout from '@components/layout/Layout';
import { useQuery } from '@tanstack/react-query';
import { getProducts as getProductsAdmin } from '@/shared/api/admin/festival'; 
import { getFestivalSchedules, getBookingStatsData, getUserStatsData, getEntranceCount  } from '@/shared/api/admin/statistics'; 
import StatisticsContent from '@/components/operatManage/statistics/StatisticsSection';
import EntranceCount from '@/components/operatManage/statistics/EntranceCount'; 
import styles from './StatisticsPage.module.css';
import TicketProgressGraph from '@/components/operatManage/statistics/TicketProgressGraph';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/common/Button';

type TabType = '통계' | '입장 인원 수 조회';

const StatisticsPage: React.FC = () => {
  const { fid } = useParams<{ fid: string }>(); 
  const [activeTab, setActiveTab] = useState<TabType>('통계');
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { data: festival } = useQuery({
    queryKey: ['festival', fid],
    queryFn: getProductsAdmin,
    select: (response) => response.data.find(f => f.fid === fid),
    enabled: !!fid,
  });

  const { data: schedules } = useQuery({
    queryKey: ['schedules', fid],
    queryFn: () => getFestivalSchedules(fid!),
    enabled: !!fid,
  });

  // 목표 달성 그래프
  const { data: bookingStatsData } = useQuery({
    queryKey: ['bookingStatsData', fid],
    queryFn: () => getBookingStatsData(fid!),
    enabled: !!fid,
  });

  // 성별/ 연령 그래프
  const { data: userStatsData } = useQuery({
    queryKey: ['userStatsData', fid],
    queryFn: () => getUserStatsData(fid!),
    enabled: !!fid,
  });

  // 인원수 조회
  const { data: entranceStatsData } = useQuery({
    queryKey: ['entranceStatsData', fid, selectedSchedule],
    queryFn: () => getEntranceCount(fid!, selectedSchedule!),
    enabled: !!fid && !!selectedSchedule && activeTab === '입장 인원 수 조회',
  });

  const selectedBookingData = useMemo(() => {
    if (!bookingStatsData || !selectedSchedule) return null;
    return bookingStatsData.data.find(d => d.performanceDate === selectedSchedule);
  }, [bookingStatsData, selectedSchedule]);

  useEffect(() => {
    setSelectedSchedule(null);
  }, [fid]);

  const handleScheduleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSchedule(e.target.value);
  };


  const isLoading = [festival, schedules, bookingStatsData, userStatsData, entranceStatsData].some(q => q?.isLoading);
  const isError = [festival, schedules, bookingStatsData, userStatsData, entranceStatsData].some(q => q?.isError);

  if (!fid) {
    return (
      <Layout subTitle="통계 조회">
        <div>공연 ID가 유효하지 않습니다.</div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout subTitle="통계 조회">
        <div>데이터를 불러오는 중...</div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout subTitle="통계 조회">
        <div>데이터 로딩 실패!</div>
      </Layout>
    );
  }

  return (
    <Layout subTitle="통계 조회">
      <div className={styles.topBar}>
        <div className={styles.tabs}>
          <p style={{ color: 'red', fontSize: 10, textAlign: 'right'}}>
          입장 인원 수와 공연 판매율은 날짜와 시간을 선택해야 확인 가능합니다.</p>
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
          <select value={selectedSchedule || ''} onChange={handleScheduleChange} disabled={!schedules?.data || schedules.data.length === 0}>
            <option value="">날짜 및 시간 선택</option>
            {schedules?.data.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      {activeTab === '통계' && userStatsData && (
        <>
          <TicketProgressGraph
            currentTickets={selectedBookingData?.bookingCount ?? 0}
            totalCapacity={selectedBookingData?.availableNOP ?? 0}
          />
  
          <StatisticsContent
            data={userStatsData.data}
          />
        </>
      )}
      {activeTab === '입장 인원 수 조회' && entranceStatsData  && (
        <EntranceCount
          count={entranceStatsData.data.checkedInCount} 
          totalCount={entranceStatsData.data.availableNOP} 
          title={festival?.fname || ''}
        />
      )}
      <div className={styles.buttonWrapper}>
        <Button onClick={() => navigate(-1)}>뒤로가기</Button>
      </div>
    </Layout>
  );
};

export default StatisticsPage;