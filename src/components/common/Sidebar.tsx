import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

interface MenuItem {
  path?: string;
  name: string;
  subMenu?: MenuItem[];
}

interface SidebarProps {
  menuItems: MenuItem[];
  userName: string; 
  userEmail: string; 
  style?: React.CSSProperties;
}

const Sidebar: React.FC<SidebarProps> = ({ menuItems, userName, userEmail, ...props }) => {
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const toggleMenu = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
    };

      return (
    <aside className={styles.sidebar}>
      <div className={styles.userInfoArea}>
        <div className={styles.userName}>{userName}</div>
        <div className={styles.userEmail}>{userEmail}</div>
      </div>

      <nav className={styles.sidebarNav}>
        <ul className={styles.menuList}>
          {menuItems.map((item) => (
            <li key={item.name} className={styles.menuItem}>
              {item.subMenu ? (
                <>
                  <div
                    className={`${styles.menuLink} ${openMenu === item.name ? styles.active : ''}`}
                    onClick={() => toggleMenu(item.name)}
                  >
                    {item.name}
                    <span
                      className={`${styles.arrow} ${openMenu === item.name ? styles.rotate : ''}`}
                    >
                    ▼
                    </span>
                  </div>
                  <ul
                    className={`${styles.subMenuList} ${
                      openMenu === item.name ? styles.open : ''
                    }`}
                  >
                    {item.subMenu.map((sub) => (
                      <li key={sub.name} className={styles.subMenuItem}>
                        <NavLink
                          to={sub.path!}
                          className={({ isActive }) =>
                            `${styles.subMenuLink} ${isActive ? styles.menuLinkActive : ''}`
                          }
                        >
                          {sub.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <NavLink
                  to={item.path!}
                  className={({ isActive }) =>
                    `${styles.menuLink} ${isActive ? styles.menuLinkActive : ''}`
                  }
                >
                  {item.name}
                </NavLink>
              )}
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