import React from 'react';
import styles from './MyInfoCardItem.module.css';

interface InfoCardItemProps {
  label: string;
  onClick: () => void;
}

const MyInfoCardItem: React.FC<InfoCardItemProps> = ({ label, onClick }) => {
  return (
    <div className={styles.card} onClick={onClick}>
      <span className={styles.label}>{label}</span>
      <span className={styles.arrow}>›</span>
    </div>
  );
};

export default MyInfoCardItem;
