// components/festival/detail/FestivalInfoDetailSection.tsx
import React from 'react';
import styles from './FestivalInfoDetailSection.module.css';
import { FaRegGrinStars } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { useFestivalDetail } from '@/models/festival/tanstack-query/useFestivalDetail';

const FestivalInfoDetailSection: React.FC = () => {
  const { fid } = useParams<{ fid: string }>();
  const { data: detail, isLoading, isError, status } = useFestivalDetail(fid ?? '');

  // 화면은 항상 섹션을 렌더하되, 내용만 상태에 따라 바꿔줌 (훅 순서 안전)
  let body: React.ReactNode = null;

  if (!fid) {
    body = <p className={styles.description}>잘못된 경로입니다.</p>;
  } else if (isLoading || status === 'idle') {
    body = <p className={styles.description}>불러오는 중…</p>;
  } else if (isError || !detail) {
    body = <p className={styles.description}>공연 정보를 불러오지 못했어요 ㅠㅠ</p>;
  } else {
    const story = detail.story?.trim();
    body = (
      <p className={styles.description}>
        {story && story.length > 0 ? story : '등록된 소개가 없습니다.'}
      </p>
    );
  }

  return (
    <section className={styles.container}>
      <h3 className={styles.title}>
        <FaRegGrinStars className={styles.icon} />
        공연 정보 상세 내용
      </h3>
      {body}
    </section>
  );
};

export default FestivalInfoDetailSection;
