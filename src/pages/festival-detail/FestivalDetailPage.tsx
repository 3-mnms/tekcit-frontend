import React, { useState } from 'react';
import Header from '@components/common/header/Header';
import Info from '@/components/festival/detail/FestivalInfoSection';
import Scheduler from '@/components/festival/detail/FestivalScheduleSection';
import InfoDetail from '@/components/festival/detail/FestivalInfoDetailSection';
import Statistics from '@/components/festival/detail/FestivalStatisticsSection';
import styles from './FestivalDetailPage.module.css';

const FestivalDetailPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'sale'>('info');

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <div className={styles.contentWrapper}>
        <Info />
        <div className={styles.schedulerSticky}>
          <Scheduler />
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className={styles.tabWrapper}>
        <div className={styles.tabMenu}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveTab('info')}
            className={`${styles.tab} ${activeTab === 'info' ? styles.active : ''}`}
          >
            공연정보
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveTab('sale')}
            className={`${styles.tab} ${activeTab === 'sale' ? styles.active : ''}`}
          >
            예매자통계
          </div>
        </div>

        {/* 선택된 탭 내용 */}
        <div className={styles.tabContent}>
          {activeTab === 'info' ? (
            <div><InfoDetail /></div>
          ) : (
            <div><Statistics /></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FestivalDetailPage;
