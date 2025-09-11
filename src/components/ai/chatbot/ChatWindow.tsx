import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './ChatWindow.module.css';
import ChatMessage from './ChatMessage';

type Props = {
  open: boolean;
  onClose: () => void;
};

const dummyConversation = [
  { id: 'm1', role: 'bot' as const, name: 'tiki', text: '안녕하세요. tekcit 고객센터 챗봇입니다.\n무엇을 도와드릴까요?' },
  { id: 'm2', role: 'user' as const, name: 'me', text: '티켓 예매 방법이 궁금해요' },
  { id: 'm3', role: 'bot' as const, name: 'tiki', text: '✨티켓 예매 방법 알기✨\n1. 회원 가입을 한다.\n2. 예매하고 싶은 공연 상세페이지에 들어간다.\n3. 예매 버튼을 누른다.\n4. 시간과 날짜를 선택한다.\n5. 결제 수단을 선택한다.\n6. 티켓 출력 방법을 선택한다.\n7. 결제 한다.\n8. 끝.' },
];

const ChatWindow: React.FC<Props> = ({ open, onClose }) => {
  const [container] = useState(() => {
    const div = document.createElement('div');
    return div;
  });

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    container.setAttribute('data-tiki-portal', 'true');
    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container);
    };
  }, [container]);

  useEffect(() => {
    if (open && bottomRef.current) {
      // 살짝 지연 후 스크롤
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    }
  }, [open]);

  const content = open ? (
    <div className={styles.wrap} role="dialog" aria-label="Tiki chat window">
      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.title}>
            <span className={styles.brand}>Tiki</span>
            <span className={styles.subtitle}>tekcit 고객센터 챗봇</span>
          </div>
          <button className={styles.closeBtn} aria-label="close" onClick={onClose}>×</button>
        </header>

        <div className={styles.body}>
          {dummyConversation.map((m) => (
            <ChatMessage key={m.id} role={m.role} name={m.name} text={m.text} />
          ))}
          <div ref={bottomRef} />
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.faqBtn}>자주 묻는 질문</button>
          <div className={styles.inputBar}>
            <input
              className={styles.input}
              placeholder="메시지를 입력하세요."
              disabled
            />
            <button className={styles.sendBtn} disabled>➤</button>
          </div>
        </footer>
      </div>
    </div>
  ) : null;

  return createPortal(content, container);
};

export default ChatWindow;
