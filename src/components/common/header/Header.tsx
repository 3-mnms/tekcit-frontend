import React from 'react';
import styles from './Header.module.css';
import logo from '@shared/assets/logo.svg';
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
        <img src={logo}alt="tekcit logo" className={styles.logo} />
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
      </div>

      <div className={styles.right}>
        {isLoggedIn ? (
          <p>마이페이지</p>
        ) : (
          <p>로그인</p>
        )}
      </div>
    </header>
  );
};

export default Header;
