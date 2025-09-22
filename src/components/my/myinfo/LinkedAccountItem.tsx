import React from 'react';
import Button from '@/components/common/button/Button';
import styles from './LinkedAccountItem.module.css';

interface LinkedAccountItemProps {
  provider: string;
  onClick?: () => void;
}

const LinkedAccountItem: React.FC<LinkedAccountItemProps> = ({ provider, onClick }) => {
  return (
    <div className={styles.item}>
      <span className={styles.name}>{provider}</span>
      <Button className={styles.button} onClick={onClick}>
        연결
      </Button>
    </div>
  );
};

export default LinkedAccountItem;
