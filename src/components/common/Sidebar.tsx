import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

// 사이드바 메뉴 항목 타입 정의, 삐약!
interface MenuItem {
  path: string;
  name: string;
}

interface SidebarProps {
  menuItems: MenuItem[];
  userType: string; 
  userName: string; 
  userEmail: string; 
}

const Sidebar: React.FC<SidebarProps> = ({ menuItems, userName, userEmail, ...props }) => {
  return (
    <aside className={styles.sidebar} {...props}>
      <div className={styles.userInfoArea}>
        <div className={styles.userName}>{userName}님</div> {/* '주최자 or 사용자 이름' */}
        <div className={styles.userEmail}>{userEmail}</div> {/* 'abc1234@test.com' */}
      </div>

      <nav className={styles.sidebarNav}>
        <ul className={styles.menuList}>
          {menuItems.map((item) => (
            <li key={item.path} className={styles.menuItem}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `${styles.menuLink} ${isActive ? styles.menuLinkActive : ''}`
                }
              >
                <span className={styles.menuIcon}></span>
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.sidebarFooter}>
        &copy; {new Date().getFullYear()} 티켓팅 삐약!
      </div>
    </aside>
  );
};

export default Sidebar;