import React from 'react';
import styles from './FestivalInfoSection.module.css';

interface FestivalInfoProps {
  posterUrl: string;
  title: string;
  description: string;
  performers?: string[];
  isLiked: boolean;
  likeCount: number;
  onToggleLike: () => void;
}

const FestivalInfoSection: React.FC<FestivalInfoProps> = ({
  posterUrl,
  title,
  description,
  performers = [],
  isLiked,
  likeCount,
  onToggleLike,
}) => {
  return (
    <section className={styles.container}>
      {/* 왼쪽: 포스터 + 찜 버튼 */}
      <div className={styles.left}>
        <img src={posterUrl} alt="포스터" className={styles.poster} />
        <button className={styles.likeBtn} onClick={onToggleLike}>
          <i className={`fa-heart ${isLiked ? 'fa-solid' : 'fa-regular'}`}></i> {likeCount}
        </button>
      </div>

      {/* 오른쪽: 제목 + 설명 + 출연자 */}
      <div className={styles.right}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
        {performers.length > 0 && (
          <p className={styles.performers}>출연: {performers.join(', ')}</p>
        )}
      </div>
    </section>
  );
};

export default FestivalInfoSection;