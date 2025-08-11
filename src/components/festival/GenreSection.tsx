import React, { useEffect, useMemo, useState } from 'react';
import styles from './CategoryPageSection.module.css';
import { getFestivals } from '@/shared/api/festival/FestivalApi';
import type { Festival } from '@/models/festival/FestivalType';
import { useParams } from 'react-router-dom';

/** 원본 → 상위(그룹) */
const CATEGORY_MAP: Record<string, string> = {
  '대중음악': '대중음악',
  '대중무용': '무용',
  '무용(서양/한국무용)': '무용',
  '뮤지컬': '뮤지컬/연극',
  '연극': '뮤지컬/연극',
  '서양음악(클래식)': '클래식/국악',
  '한국음악(국악)': '클래식/국악',
  '서커스/마술': '서커스/마술',
};
const normalizeGroup = (original?: string) => original ? (CATEGORY_MAP[original] ?? '복합') : '복합';

/** 슬러그 → 상위(그룹) */
const SLUG_TO_GROUP: Record<string, string> = {
  pop: '대중음악',
  dance: '무용',
  theater: '뮤지컬/연극',
  classic: '클래식/국악',
  art: '서커스/마술',
  mix: '복합',
};

/** 상위(그룹) → 하위(원본) 목록 */
const GROUP_TO_CHILDREN: Record<string, string[]> = {
  '대중음악': ['대중음악'],
  '무용': ['무용(서양/한국무용)', '대중무용'],
  '뮤지컬/연극': ['뮤지컬', '연극'],
  '클래식/국악': ['서양음악(클래식)', '한국음악(국악)'],
  '서커스/마술': ['서커스/마술'],
  '복합': [], // 미매핑 모음 — 상세 버튼 없음
};

const GenreSection: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const group = SLUG_TO_GROUP[slug]; // 상위 카테고리
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const raw = await getFestivals();
      setFestivals(raw);
    })();
  }, []);

  // 현재 그룹에 속하는 데이터
  const inGroup = useMemo(
    () => festivals.filter(f => normalizeGroup(f.genrename) === group),
    [festivals, group]
  );

  // 하위 카테고리(원본) 목록
  const children = GROUP_TO_CHILDREN[group] ?? [];
  const showChildButtons = children.length > 1; // 2개 이상일 때만 버튼 노출

  // Child 버튼 클릭 → 토글 (같은 버튼 다시 누르면 전체로)
  const handlePickChild = (c: string) =>
    setSelectedChild(prev => (prev === c ? null : c));

  // 최종 표시 목록
  const list = useMemo(() => {
    if (!showChildButtons || !selectedChild) return inGroup;
    return inGroup.filter(f => f.genrename === selectedChild);
  }, [inGroup, selectedChild, showChildButtons]);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.title}>{group} 공연</h2>

        {/* 상세(원본) 카테고리 버튼: 하위가 2개 이상일 때만 */}
        {showChildButtons && (
          <div className={styles.tabList}>
            {children.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handlePickChild(c)}
                className={`${styles.tabButton} ${selectedChild === c ? styles.active : ''}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.cardGrid}>
        {list.map((f) => (
          <div key={f.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <img src={f.poster} alt={f.fname} className={styles.image} />
            </div>
            <h3 className={styles.name}>{f.fname}</h3>
            <p className={styles.meta}>
              {f.fdfrom === f.fdto ? f.fdfrom : `${f.fdfrom} ~ ${f.fdto}`}
            </p>
            <p className={styles.meta}>{f.area} · {f.fcltynm}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GenreSection;
