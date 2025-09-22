import React, { useState } from 'react';
import styles from './TikiChatWidget.module.css';
import tikiLogo from '@/shared/assets/tiki.png';
import ChatWindow from './ChatWindow';

const TikiChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
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

      <ChatWindow open={open} />
    </>
  );
};

export default TikiChatWidget;
