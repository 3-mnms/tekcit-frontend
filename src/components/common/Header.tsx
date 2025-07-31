import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from './Header.module.css';
import logo from '@shared/assets/logo.png';

interface HeaderProps {
  userName: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ userName, onLogout, ...props }) => {
  const [timeLeft, setTimeLeft] = useState(3600);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onLogout();            
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onLogout]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const extendSession = () => {
    setTimeLeft(3600);
  };

  // 시간이 5분 남았을 경우 글씨가 빨간색으로 표시
  const sessionTimeStyle =
    timeLeft <= 300 ? `${styles.sessionTime} ${styles.sessionTimeWarning}` : styles.sessionTime;


  return (
    <header className={styles.header} {...props}>
      <div className={styles.left}>
        <img src={logo}alt="tekcit logo" className={styles.logo} />
      </div>

       <div className={styles.right}>
        <span className={styles.userInfo}><strong>{userName}</strong></span>
        <span className={styles.separator}>|</span>
        <a href="#" onClick={(e) => {e.preventDefault(); onLogout(); navigate('/login');}} className={styles.logoutLink}>
          로그아웃
        </a>
        <span className={styles.separator}>|</span>
        <span className={sessionTimeStyle}>{formatTime(timeLeft)}</span>
        <span className={styles.separator}>|</span>
        <button onClick={extendSession} className={styles.extendButton}>
          시간 연장
        </button>
      </div>
    </header>
  );
};

export default Header;
