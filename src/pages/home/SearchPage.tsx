import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@components/common/header/Header'; // 실제 Header 경로에 맞게 수정해줘
import Filter from '@components/festival/search/FilterPanel';
import Result from '@components/festival/search/ResultPanel';
import styles from './SearchPage.module.css';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleHeaderSearch = (kw: string) => {
    const params = new URLSearchParams(location.search);
    params.set('keyword', kw.trim());
    params.set('page', '1'); // 새 검색 시 1페이지로 초기화
    navigate(`/search?${params.toString()}`, { replace: false });
  };

  return (
    <>
      <Header onSearch={handleHeaderSearch} />
      <div className={styles.page}>
        <aside className={styles.filterCol}>
          <Filter />
        </aside>
        <main className={styles.resultsCol}>
          <Result />
        </main>
      </div>
    </>
  );
};

export default SearchPage;