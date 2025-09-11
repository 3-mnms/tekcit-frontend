// src/components/chatbot/ChatWindow.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './ChatWindow.module.css'
import ChatMessage from './ChatMessage'
import { useChatbot } from '@/models/ai/tanstack-query/useChatbot'

type Props = { open: boolean; onClose: () => void }

type Msg = { id: string; role: 'bot' | 'user'; text: string }

const seed: Msg[] = [
  {
    id: 'm1',
    role: 'bot',
    text: '안녕하세요 고객님! 테킷 고객센터 챗봇입니다.\n무엇을 도와드릴까요?',
  },
]

const ChatWindow: React.FC<Props> = ({ open, onClose }) => {
  const [container] = useState(() => document.createElement('div'))
  const [msgs, setMsgs] = useState<Msg[]>(seed)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const { mutateAsync, isPending } = useChatbot()

  useEffect(() => {
    container.setAttribute('data-tiki-portal', 'true')
    document.body.appendChild(container)
    return () => {
      document.body.removeChild(container)
    }
  }, [container])

  useEffect(() => {
    if (open) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0)
  }, [open, msgs.length])

  const send = async () => {
    const q = input.trim()
    if (!q) return

    // 1) 유저 메시지 1번만 추가
    const userMsg: Msg = { id: crypto.randomUUID(), role: 'user', text: q }
    setMsgs((m) => [...m, userMsg])
    setInput('')

    try {
      // 2) 서버 호출 (라이브/데모 분기)
      const answer = await mutateAsync(q);
      // 3) 봇 메시지 추가 (유저 메시지 다시 넣지 않기)
      const botMsg: Msg = { id: crypto.randomUUID(), role: 'bot', text: answer }
      setMsgs((m) => [...m, botMsg])
    } catch (e: any) {
      const botErr: Msg = {
        id: crypto.randomUUID(),
        role: 'bot',
        text: String(e?.response?.data ?? e?.message ?? '챗봇 호출 중 오류가 발생했어요.'),
      }
      setMsgs((m) => [...m, botErr])
    }
  }

  const content = open ? (
    <div className={styles.wrap} role="dialog" aria-label="Tiki chat window">
      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.title}>
            <span className={styles.brand}>Tiki</span>
            <span className={styles.subtitle}>tekcit 고객센터 챗봇</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </header>

        <div className={styles.body}>
          {msgs.map((m) => (
            <ChatMessage key={m.id} role={m.role} name={m.role} text={m.text} />
          ))}
          {isPending && (
            <div style={{ fontSize: 12, opacity: 0.7, color: '#64748b' }}>답변 생성 중…</div>
          )}
        </div>

        <footer className={styles.footer}>
          <div className={styles.inputBar}>
            <input
              className={styles.input}
              placeholder="메시지를 입력하세요."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') send()
              }}
              disabled={isPending}
            />
            <button className={styles.sendBtn} onClick={send} disabled={isPending || !input.trim()}>
              ➤
            </button>
          </div>
        </footer>
      </div>
    </div>
  ) : null

  return createPortal(content, container)
}

export default ChatWindow
