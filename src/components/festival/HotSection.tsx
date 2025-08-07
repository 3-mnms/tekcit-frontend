import React, { useEffect, useState } from 'react';
import styles from './HotSection.module.css';
import type { Festival, FestivalWithViews } from '@models/festival/FestivalType';
import { getFestivals, getFestivalViews } from '@/shared/api/festival/FestivalApi';

const HotSection = () => {
  const [hotFestivals, setHotFestivals] = useState<FestivalWithViews[]>([]);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 640) setVisibleCount(2);        // 모바일
      else if (width < 1024) setVisibleCount(3);  // 태블릿
      else if (width < 1280) setVisibleCount(4);  // 중간 사이즈
      else setVisibleCount(5);                    // PC
    };

    handleResize(); // 초기 실행
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const festivals = await getFestivals();

        const withViewsPromises = festivals.slice(0, 20).map(async (festival) => {
          const views = await getFestivalViews(festival.id);
          return { ...festival, views };
        });

        const withViews = await Promise.all(withViewsPromises);
        const sorted = withViews.sort((a, b) => b.views - a.views);
        setHotFestivals(sorted); // 전부 저장 (visibleCount로 자르기 위함)
      } catch (err) {
        console.error('🔥 Hot 공연 불러오기 실패', err);
      }
    };

    fetchData();
  }, []);

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>오늘의 hot 공연</h2>
      <div className={styles.cardList}>
        {hotFestivals.slice(0, visibleCount).map((festival, index) => (
          <div key={festival.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <img src={festival.poster} alt={festival.fname} className={styles.image} />
              <span className={styles.rank}>{index + 1}</span>
            </div>
            <div className={styles.content}>
              <h3 className={styles.name}>{festival.fname}</h3>
              <p className={styles.location}>{festival.fcltynm}</p>
              <p className={styles.date}>
                {festival.fdfrom === festival.fdto
                  ? festival.fdfrom
                  : `${festival.fdfrom} ~ ${festival.fdto}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HotSection;
