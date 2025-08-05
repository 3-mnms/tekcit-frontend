import React, { useState } from 'react';
import styles from './CategorySection.module.css';

const categories = ['콘서트', '뮤지컬', '연극', '페스티벌'];

const CategorySection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('콘서트');

  return (
    <section className={styles.section}>
      {/* 섹션 제목 */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.title}>카테고리별 공연</h2>
        <div className={styles.tabList}>
        {categories.map((cat) => (
            <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`${styles.tabButton} ${
                selectedCategory === cat ? styles.active : ''
            }`}
            >
            {cat}
            </button>
        ))}
        </div>
     </div>

      {/* 선택된 카테고리의 공연 카드 리스트 */}
        <div className={styles.cardSlider}>
        {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className={styles.card}>
            {selectedCategory} 공연 {n}
            </div>
        ))}
        </div>
    </section>
  );
};

export default CategorySection;