// components/festival/detail/FestivalInfoSection.tsx
import React from 'react';
import styles from './FestivalInfoSection.module.css';
import { useParams } from 'react-router-dom';
import { useFestivalDetail } from '@/models/festival/tanstack-query/useFestivalDetail';

const formatPrice = (n?: number) => (typeof n === 'number' ? n.toLocaleString() + '원' : '');

const FestivalInfoSection: React.FC = () => {
  const { fid } = useParams<{ fid: string }>();
  const { data: detail, isLoading, isError, status } = useFestivalDetail(fid ?? '');

  // 화면은 항상 렌더하되 내용만 상태에 따라 바꿈 (훅 순서 고정)
  if (!fid) {
    return <section className={styles.container}>잘못된 경로입니다.</section>;
  }

  if (isLoading || status === 'idle') {
    return (
      <section className={styles.container}>
        <h1 className={styles.title}>로딩 중…</h1>
      </section>
    );
  }

  if (isError || !detail) {
    return (
      <section className={styles.container}>
        <h1 className={styles.title}>공연 정보를 불러오지 못했어요 ㅠㅠ</h1>
      </section>
    );
  }

  // detail이 이제 확실히 존재
  return (
    <section className={styles.container}>
      <div className={styles.left}>
        {detail.poster ? (
          <img src={detail.poster} alt={`${detail.prfnm} 포스터`} className={styles.poster} />
        ) : (
          <div className={styles.posterPlaceholder}>No Image</div>
        )}
        {/* 찜 기능은 나중에 연결 */}
        <button className={styles.likeBtn} type="button">
          <i className="fa-heart fa-regular" /> 0
        </button>
      </div>

      <div className={styles.right}>
        <h2 className={styles.title}>{detail.prfnm}</h2>

        {/* 한 줄 라벨:값 */}
        <div className={styles.infoRows}>
          <div className={styles.infoRow}>
            <span className={styles.label}>공연장소</span>
            <span className={styles.value}>{detail.fcltynm}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>공연기간</span>
            <span className={styles.value}>
              {detail.prfpdfrom} ~ {detail.prfpdto}
            </span>
          </div>
          {detail.runningTime && (
            <div className={styles.infoRow}>
              <span className={styles.label}>러닝타임</span>
              <span className={styles.value}>{detail.runningTime}</span>
            </div>
          )}
          {detail.prfage && (
            <div className={styles.infoRow}>
              <span className={styles.label}>관람연령</span>
              <span className={styles.value}>{detail.prfage}</span>
            </div>
          )}
          <div className={styles.infoRow}>
            <span className={styles.label}>가격</span>
            <span className={styles.value}>{formatPrice(detail.ticketPrice)}</span>
          </div>
          {detail.fcast && (
            <div className={`${styles.infoRow} ${styles.fullRow}`}>
              <span className={styles.label}>출연</span>
              <span className={styles.value}>{detail.fcast}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FestivalInfoSection;
