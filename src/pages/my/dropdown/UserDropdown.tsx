import React from 'react';
import styles from './UserDropdown.module.css';
import PointBox from '@components/my/dropdown/PointBox';
import MenuItem from '@components/my/dropdown/MenuItem';

import { HiOutlineSpeakerphone, HiOutlineChevronRight } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const UserDropdown: React.FC = () => {
  const navigate = useNavigate();

  const handleAlarmClick = () => {
    alert('알림 클릭됨!');
  };

  const handleGoToMypage = () => {
    navigate('/mypage');
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
        onClick={() => alert('로그아웃!')}
      >
        로그아웃
      </button>
    </div>
  );
};

export default UserDropdown;
