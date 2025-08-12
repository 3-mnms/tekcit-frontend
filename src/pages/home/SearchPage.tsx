import React from 'react';
import Header from '@components/common/header/Header'; // 실제 Header 경로에 맞게 수정해줘
import Filter from '@/components/festival/Search/FilterPanel';
import Result from '@/components/festival/Search/ResultPanel';
import styles from './SearchPage.module.css';

const SearchPage: React.FC = () => {
    
  return (
    <>
        <Header />
        <div className={styles.page}>
            <Filter />
            <Result />
        </div>
    </>
  );
};

export default SearchPage;