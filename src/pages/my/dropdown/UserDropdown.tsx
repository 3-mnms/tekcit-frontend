// src/components/my/dropdown/UserDropdown.tsx
import React, { useState } from 'react';
import styles from './UserDropdown.module.css';
import PointBox from '@components/my/dropdown/PointBox';
import MenuItem from '@components/my/dropdown/MenuItem';
import { HiOutlineSpeakerphone, HiOutlineChevronRight } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

import { logout as logoutApi } from '@/shared/api/auth/login';
import { useAuthStore } from '@/shared/storage/useAuthStore';

const UserDropdown: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);     
  const userName = useAuthStore((s) => s.user?.name) || '사용자명';
  const [loading, setLoading] = useState(false);

  const handleAlarmClick = () => {
    alert('알림 클릭됨!');
  };

  const handleGoToMypage = () => {
    navigate('/mypage');
  };

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await logoutApi(); // 서버 세션/쿠키 정리 시도
    } catch (e) {
      console.error('logout failed (server):', e);
      // 서버 에러여도 클라 상태는 정리한다
    } finally {
      logout(); // ✅ accessToken / user / isLoggedIn 모두 초기화
      setLoading(false);
      alert('로그아웃!');
      navigate('/login');
    }
  };

  return (
    <div className={styles.dropdown}>
      <div className={styles.header}>
        <button className={styles.usernameButton} onClick={handleGoToMypage}>
          <span className={styles.username}>{userName}</span>
          <HiOutlineChevronRight className={styles.usernameIcon} />
        </button>
        <button className={styles.alarmButton} onClick={handleAlarmClick}>
          <HiOutlineSpeakerphone className={styles.alarmIcon} />
        </button>
      </div>

      <PointBox />

      <MenuItem label="내 정보 수정" />
      <MenuItem label="내 티켓" />
      <MenuItem label="북마크" />

      <button
        className={styles.logoutButton}
        onClick={handleLogout}
        disabled={loading}
      >
        {loading ? '로그아웃 중...' : '로그아웃'}
      </button>
    </div>
  );
};

export default UserDropdown;
