import React, { useState } from 'react';
import Header from '@components/common/header/Header';
import Info from '@components/festival/FestivalInfoSection';
import Scheduler from '@components/festival/FestivalScheduleSection';
import '@fortawesome/fontawesome-free/css/all.min.css';
import styles from './FestivalDetailPage.module.css';

const FestivalDetailPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'sale'>('info');

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <div className={styles.contentWrapper}>
        <Info />
        <Scheduler />
      </div>

      {/* 탭 메뉴 */}
      <div className={styles.tabWrapper}>
        <div className={styles.tabMenu}>
          <button
            className={`${styles.tab} ${activeTab === 'info' ? styles.active : ''}`}
            onClick={() => setActiveTab('info')}
          >
            공연정보
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'sale' ? styles.active : ''}`}
            onClick={() => setActiveTab('sale')}
          >
            예매자통계
          </button>
        </div>

        {/* 선택된 탭 내용 */}
        <div className={styles.tabContent}>
          {activeTab === 'info' ? (
            <div>🎭 공연 정보 상세 내용</div>
          ) : (
            <div>💸 판매 정보 상세 내용</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FestivalDetailPage;
