import React from 'react';

type ChatMessageProps = {
  role: 'bot' | 'user';
  text: string;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ role, text }) => {
  const isUser = role === 'user';
  return (
    <div
      className={isUser ? 'chatRowUser' : 'chatRowBot'}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      <div
        style={{
          maxWidth: '78%',
          whiteSpace: 'pre-wrap',
          fontSize: 14,
          lineHeight: 1.4,
          padding: '10px 12px',
          borderRadius: 12,
          background: isUser ? '#4D9AFD' : '#ffffff',
          color: isUser ? '#fff' : '#0f172a',
          border: isUser ? 'none' : '1px solid #e2e8f0',
          boxShadow: isUser ? 'none' : '0 2px 6px rgba(15,23,42,.05)',
        }}
      >
        {!isUser && <div style={{ fontSize: 12, opacity: .7, marginBottom: 4 }}>Tiki</div>}
        {text}
      </div>
    </div>
  );
};

export default ChatMessage;
