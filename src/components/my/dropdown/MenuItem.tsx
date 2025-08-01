import React from 'react';
import styles from './MenuItem.module.css';

interface MenuItemProps {
  label: string;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ label, onClick }) => {
  return (
    <div className={styles.item} onClick={onClick}>
      <span>{label}</span>
      <span className={styles.arrow}>›</span>
    </div>
  );
};

export default MenuItem;
