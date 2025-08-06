import React from 'react';
import styles from './FestivalInfoDetailSection.module.css';
import { FaRegGrinStars } from 'react-icons/fa';

const FestivalInfoDetailSection: React.FC = () => {
  return (
    <section className={styles.container}>
      <h3 className={styles.title}>
        <FaRegGrinStars className={styles.icon} />
        공연 정보 상세 내용
      </h3>
      <p className={styles.description}>
        추후 API에서 공연 정보를 불러와 표시됩니다.
      </p>
    </section>
  );
};

export default FestivalInfoDetailSection;
