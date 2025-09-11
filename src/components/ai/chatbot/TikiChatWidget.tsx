import React, { useState } from 'react';
import styles from './TikiChatWidget.module.css';
import tikiLogo from '@/shared/assets/tiki.png';
import ChatWindow from './ChatWindow';

const TikiChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        aria-label="Tiki customer chat"
        className={`${styles.fab} ${open ? styles.fabActive : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <span className={styles.closeIcon}>×</span>
        ) : (
          <img src={tikiLogo} alt="Tiki" className={styles.logo} /> 
        )}
      </button>

      {/* 포털로 띄우는 채팅창 (닫기 버튼은 제거) */}
      <ChatWindow open={open} />
    </>
  );
};

export default TikiChatWidget;
