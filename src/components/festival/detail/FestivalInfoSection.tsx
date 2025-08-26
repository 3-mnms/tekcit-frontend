import React from 'react';
import styles from './FestivalInfoSection.module.css';
import type { FestivalDetail } from '@/models/festival/rfestivalType';

type Props = {
  detail?: FestivalDetail;
  loading?: boolean;
};

const formatDate = (iso?: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${y}.${m}.${d}`;
};
const formatPrice = (n?: number) =>
  typeof n === 'number' ? n.toLocaleString() + '원' : '';

const FestivalInfoSection: React.FC<Props> = ({ detail, loading }) => {
  if (loading && !detail) {
    return (
      <section className={styles.container}>
        <div className={styles.left}>
          <div className={styles.posterPlaceholder}>Loading…</div>
          <button className={styles.likeBtn}><i className="fa-heart fa-regular" /> 0</button>
        </div>
        <div className={styles.right}>
          <h1 className={styles.title}>로딩 중…</h1>
        </div>
      </section>
    );
  }

  if (!detail) {
    return (
      <section className={styles.container}>
        <div className={styles.right}>
          <h1 className={styles.title}>공연 정보를 불러오지 못했어요</h1>
        </div>
      </section>
    );
  }

  const performers =
    detail.fcast ? detail.fcast.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <section className={styles.container}>
      {/* 왼쪽: 포스터 + 찜 */}
      <div className={styles.left}>
        {detail.poster ? (
          <img src={detail.poster} alt={`${detail.prfnm} 포스터`} className={styles.poster} />
        ) : (
          <div className={styles.posterPlaceholder}>No Image</div>
        )}
        <button className={styles.likeBtn} type="button">
          <i className="fa-heart fa-regular" /> 0
        </button>
      </div>

      {/* 오른쪽: DTO 그대로 표기 */}
      <div className={styles.right}>
        <h1 className={styles.title}>{detail.prfnm}</h1>

        <div className={styles.infoRows}>
          <div className={styles.infoRow}>
            <span className={styles.label}>공연장소</span>
            <span className={styles.value}>{detail.fcltynm}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>공연기간</span>
            <span className={styles.value}>
              {formatDate(detail.prfpdfrom)} ~ {formatDate(detail.prfpdto)}
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
          {performers.length > 0 && (
            <div className={`${styles.infoRow} ${styles.fullRow}`}>
              <span className={styles.label}>출연</span>
              <span className={styles.value}>{performers.join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FestivalInfoSection;
