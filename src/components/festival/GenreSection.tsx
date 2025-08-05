import React, { useState } from 'react';
import styles from './GenreSection.module.css'; // 파일명도 바뀜!

const genres = ['콘서트', '뮤지컬', '연극', '페스티벌'];

const GenreSection: React.FC = () => {
  const [selectedGenre, setSelectedGenre] = useState('콘서트');

  return (
    <section className={styles.section}>
      {/* 섹션 제목 */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.title}>분야별 공연</h2>
        <div className={styles.tabList}>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`${styles.tabButton} ${
                selectedGenre === genre ? styles.active : ''
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* 선택된 분야의 공연 카드 리스트 */}
      <div className={styles.cardSlider}>
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className={styles.card}>
            {selectedGenre} 공연 {n}
          </div>
        ))}
      </div>
    </section>
  );
};

export default GenreSection;
