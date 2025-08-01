import React from 'react'
import styles from './UserDropdown.module.css'
import PointBox from '@components/my/dropdown/PointBox'
import MenuItem from '@components/my/dropdown/MenuItem'

import { HiOutlineSpeakerphone } from 'react-icons/hi'

const UserDropdown: React.FC = () => {
  const handleAlarmClick = () => {
    alert('알림 클릭됨!')
  }

  return (
    <div className={styles.dropdown}>
      <div className={styles.header}>
        <h2 className={styles.username}>사용자명</h2>
        <button className={styles.alarmButton} onClick={handleAlarmClick}>
          <HiOutlineSpeakerphone className={styles.alarmIcon} />
        </button>
      </div>

      <PointBox />

      <MenuItem label="본인인증" />
      <MenuItem label="내 티켓" />
      <MenuItem label="내 정보 수정" />
      <MenuItem label="북마크" />

      <button className={styles.logoutButton} onClick={() => alert('로그아웃!')}>
        로그아웃
      </button>
    </div>
  )
}

export default UserDropdown
