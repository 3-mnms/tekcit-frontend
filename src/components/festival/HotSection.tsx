import React, { useEffect, useMemo, useState } from 'react';
import styles from './HotSection.module.css';
import type { Festival, FestivalWithViews } from '@models/festival/FestivalType';
import { getFestivals, getFestivalViews } from '@/shared/api/festival/FestivalApi';
import { useParams } from 'react-router-dom';

// ✅ 라우트 슬러그 -> 그룹 카테고리 (프로젝트 전역 라벨과 동일하게 통일)
const slugToCategory: Record<string, string> = {
  pop: '대중음악',
  dance: '무용',
  theater: '뮤지컬/연극',
  classic: '클래식/국악',
  art: '서커스/마술',
  mix: '복합',
};

// ✅ 원본 카테고리 -> 그룹 카테고리
const CATEGORY_MAP: Record<string, string> = {
  // 백엔드 원본 값들
  '대중무용': '무용',
  '무용(서양/한국무용)': '무용',
  '대중음악': '대중음악',
  '뮤지컬': '뮤지컬/연극',
  '연극': '뮤지컬/연극',
  '서양음악(클래식)': '클래식/국악',
  '한국음악(국악)': '클래식/국악',
  '서커스/마술': '서커스/마술',
  // 나머지 미매핑 값은 아래 normalize에서 '복합' 처리
};

const normalizeCategory = (original?: string): string => {
  if (!original) return '복합';
  return CATEGORY_MAP[original] ?? '복합';
};

const HotSection: React.FC = () => {
  const { name: slug } = useParams<{ name?: string }>(); // ex) /category/theater
  const [hotFestivals, setHotFestivals] = useState<FestivalWithViews[]>([]);
  const [visibleCount, setVisibleCount] = useState(5);

  // ✅ 슬러그가 있으면 해당 그룹 카테고리, 없으면 null
  const selectedCategory = useMemo(
    () => (slug ? slugToCategory[slug] ?? null : null),
    [slug]
  );

  useEffect(() => {
    const handleResize = () => {
      const ratio = window.innerWidth / window.innerHeight;
      if (ratio < 0.7) setVisibleCount(2);      // 모바일 세로형
      else if (ratio < 0.9) setVisibleCount(3); // 태블릿
      else if (ratio < 1.2) setVisibleCount(4); // 노트북
      else setVisibleCount(5);                  // 와이드
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const festivals: Festival[] = await getFestivals();

        // ✅ 백엔드 카테고리 필드 탐색 (스키마 차이를 최대한 흡수)
        const getOriginalCategory = (f: Festival): string =>
          (f as any).genrename ??
          (f as any).category ??
          (f as any).genre ??
          (f as any).fcategory ??
          (f as any).fctg ??
          '';

        // ✅ 카테고리 페이지면 해당 그룹만 필터링
        const filtered = selectedCategory
          ? festivals.filter((f) => normalizeCategory(getOriginalCategory(f)) === selectedCategory)
          : festivals;

        // ✅ 조회수 가져와서 랭킹 정렬 (상위 20개만 계산)
        const withViewsPromises = filtered.slice(0, 20).map(async (festival) => {
          const views = await getFestivalViews(festival.id);
          return { ...(festival as any), views } as FestivalWithViews;
        });

        const withViews = await Promise.all(withViewsPromises);
        withViews.sort((a, b) => b.views - a.views);
        setHotFestivals(withViews);
      } catch (err) {
        console.error('🔥 Hot 공연 불러오기 실패', err);
      }
    };

    fetchData();
  }, [selectedCategory]);

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>
        {selectedCategory ? `${selectedCategory} HOT 공연` : '오늘의 HOT 공연'}
      </h2>

      <div className={styles.cardList}>
        {hotFestivals.slice(0, visibleCount).map((festival, index) => (
          <div key={festival.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <img src={festival.poster} alt={festival.fname} className={styles.image} />
              <span className={styles.rank}>{index + 1}</span>
            </div>
            <div className={styles.content}>
              <h3 className={styles.name}>{festival.fname}</h3>
              <p className={styles.location}>{(festival as any).fcltynm}</p>
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
