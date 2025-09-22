// components/common/SubHeader.tsx
import React from 'react';
import styles from './SubHeader.module.css'; // SubHeader.module.css 파일을 import!

interface SubHeaderProps {
  title: string;
}

const SubHeader: React.FC<SubHeaderProps> = ({ title, ...props }) => {
  return (
    <div className={styles.subHeader} {...props}>
      <h2 className={styles.Title}>{title}</h2>
    </div>
  );
};

export default SubHeader;