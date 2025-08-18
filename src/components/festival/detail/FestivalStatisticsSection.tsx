import React from 'react';
import styles from './FestivalStatisticsSection.module.css';
import { FaChartBar } from 'react-icons/fa';

const FestivalStatisticsSection: React.FC = () => {
  return (
    <section className={styles.container}>
      <h3 className={styles.title}>
        <FaChartBar className={styles.icon} />
        판매 정보 상세 내용
      </h3>
      <p className={styles.description}>
        추후 API에서 판매 통계 정보를 불러와 표시됩니다.
      </p>
    </section>
  );
};

export default FestivalStatisticsSection;
