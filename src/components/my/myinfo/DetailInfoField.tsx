import React from 'react';
import styles from './DetailInfoField.module.css';
interface InfoFieldProps {
  label: string;
  value: string;
}

const DetailInfoField: React.FC<InfoFieldProps> = ({ label, value }) => {
  return (
    <div className={styles.field}>
      <div className={styles.labelArea}>
        <span className={styles.label}>{label}</span>
      </div>
      <span className={styles.value}>{value}</span>
    </div>
  );
};

export default DetailInfoField;
