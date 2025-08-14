// src/components/my/dropdown/UserDropdown.tsx
import React, { useState } from 'react';
import styles from './UserDropdown.module.css';
import PointBox from '@components/my/dropdown/PointBox';
import MenuItem from '@components/my/dropdown/MenuItem';
import { HiOutlineSpeakerphone, HiOutlineChevronRight } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

import { logout as logoutApi } from '@/shared/api/auth/login';
import { tokenStore } from '@/shared/storage/tokenStore';
import { useAuthStore } from '@/shared/storage/useAuthStore';

const UserDropdown: React.FC = () => {
  const navigate = useNavigate();
  const clearUser = useAuthStore((s) => s.clearUser);
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
      // 1) 서버 세션/토큰 정리
      await logoutApi();
    } catch (e) {
      // 서버 오류여도 클라이언트 상태는 정리
      console.error('logout failed (server):', e);
    } finally {
      // 2) 클라이언트 토큰/스토어 정리
      tokenStore.clear();
      clearUser();
      setLoading(false);
      alert('로그아웃!');
      // 3) 홈으로 이동 (또는 로그인 페이지로)
      navigate('/login');
    }
  };

  return (
    <div className={styles.dropdown}>
      <div className={styles.header}>
        <button className={styles.usernameButton} onClick={handleGoToMypage}>
          <span className={styles.username}>사용자명</span>
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