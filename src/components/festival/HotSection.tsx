import React from 'react';
import styles from './HotSection.module.css';

const HotSection = () => {
  const dummyData = [1, 2, 3]; // 나중에 실제 공연 데이터로 대체 가능

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>오늘의 hot 공연</h2>
      <div className={styles.cardList}>
        {dummyData.map((_, idx) => (
          <div key={idx} className={styles.card}></div>
        ))}
      </div>
    </section>
  );
};

export default HotSection;