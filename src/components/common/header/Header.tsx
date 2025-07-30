import React from 'react';
import styles from './Header.module.css';
import { CommonButton } from '@components/common/Button';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  isLoggedIn: boolean;
  onSearch: (keyword: string) => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, onSearch }) => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = React.useState('');

  const handleSearch = () => {
    if (keyword.trim()) {
      onSearch(keyword.trim());
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <img src="/logo.svg" alt="tekcit logo" className={styles.logo} />
        <span className={styles.category}>콘서트 / 페스티벌 / 등</span>
      </div>

      <div className={styles.center}>
        <input
          type="text"
          placeholder="검색창"
          className={styles.searchInput}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
        />
        <CommonButton onClick={handleSearch}>검색</CommonButton>
      </div>

      <div className={styles.right}>
        {isLoggedIn ? (
          <CommonButton onClick={() => navigate('/mypage')}>마이페이지</CommonButton>
        ) : (
          <CommonButton onClick={() => navigate('/login')}>로그인</CommonButton>
        )}
      </div>
    </header>
  );
};

export default Header;
