import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const sidebarItems = [
  {
    section: '내 정보 수정',
    items: [
      { label: '기본정보', to: 'info' },
      { label: '비밀번호 변경', to: 'password' },
      { label: '연결된 계정', to: 'linked' },
      { label: '배송지 관리', to: 'address' },
      { label: '회원 탈퇴', to: 'withdraw' },
    ],
  },
  {
    section: '인증 정보',
    items: [
      { label: '본인인증', to: 'verification' },
    ],
  },
  {
    section: '내 티켓',
    items: [
      { label: '예매/취소 내역', to: 'tickets' },
      { label: '양도', to: 'transfer' },
      { label: '입장 인원 수 조회', to: 'entry' },
    ],
  },
  {
    section: '북마크',
    items: [
      { label: '공연 북마크', to: 'bookmarks' },
    ],
  },
];

const Sidebar: React.FC = () => {
  return (
    <aside className={styles.sidebar}>
      {sidebarItems.map((group, index) => (
        <div key={index}>
          <p className={styles.section}>{group.section}</p>
          {group.items && (
            <ul className={styles.menu}>
              {group.items.map((item, idx) => (
                <li key={idx}>
                  <NavLink
                    to={`/mypage/${item.to}`}
                    className={({ isActive }) =>
                      `${styles.menuItem} ${isActive ? styles.active : ''}`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
