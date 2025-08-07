import React, { useState, useEffect } from 'react';
import styles from './CategorySection.module.css';
import { getFestivalCategories, getFestivals } from '@/shared/api/festival/FestivalApi';
import type { Festival } from '@/models/festival/FestivalType';

const CATEGORY_MAP: { [key: string]: string } = {
  '대중음악': '대중음악',
  '무용(서양/한국무용)': '무용',
  '뮤지컬': '뮤지컬/연극',
  '연극': '뮤지컬/연극',
  '서양음악(클래식)': '클래식',
  '한국음악(국악)': '클래식',
  '서커스/마술': '서커스/마술',
};

const SIMPLIFIED_CATEGORIES = ['대중음악', '무용', '뮤지컬/연극', '클래식', '서커스/마술'];

const CategorySection: React.FC = () => {
  const [categories] = useState<string[]>(SIMPLIFIED_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('대중음악');
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    const handleResize = () => {
      const vw = window.innerWidth / window.innerHeight;

      if (vw < 0.6) setVisibleCount(2); // 세로 길이가 훨씬 긴 화면 (모바일)
      else if (vw < 1.1) setVisibleCount(3); // 중간 뷰포트 비율 (태블릿)
      else if (vw < 1.2) setVisibleCount(4); // 노트북 등
      else setVisibleCount(5); // 와이드 PC
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rawFestivals = await getFestivals();
        setFestivals(rawFestivals);
      } catch (err) {
        console.error('🚨 공연 리스트 불러오기 실패', err);
      }
    };
    fetchData();
  }, []);

  const filteredFestivals = festivals.filter((festival) => {
    const mapped = CATEGORY_MAP[festival.genrename];
    return mapped === selectedCategory;
  });

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.title}>카테고리별 공연</h2>
        <div className={styles.tabList}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`${styles.tabButton} ${selectedCategory === cat ? styles.active : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.cardSlider}>
        {filteredFestivals.slice(0, visibleCount).map((festival) => (
          <div key={festival.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <img src={festival.poster} alt={festival.fname} className={styles.image} />
            </div>
            <h3 className={styles.name}>{festival.fname}</h3>
            <p className={styles.date}>
              {festival.fdfrom === festival.fdto ? festival.fdfrom : `${festival.fdfrom} ~ ${festival.fdto}`}
            </p>
            <p className={styles.location}>
              {festival.area} · {festival.fcltynm}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
