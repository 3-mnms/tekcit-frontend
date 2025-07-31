import React from 'react';
import styles from './Header.module.css';
import logo from '@shared/assets/logo.png';
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
        <div className={styles.searchWrapper}>
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
          <i
            className="fa-solid fa-magnifying-glass"
            onClick={handleSearch}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </div>

      <div className={styles.right}>
        {isLoggedIn ? (
          <div className={styles.rightButton} onClick={() => navigate('/login')}>
            <i className="fa-regular fa-user" />
            <p style={{ margin: 0 }}>로그인</p>
          </div>
        ) : (
          <div className={styles.rightButton} onClick={() => navigate('/mypage')}>
            <i className="fa-regular fa-user" />
            <p style={{ margin: 0 }}>마이페이지</p>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
