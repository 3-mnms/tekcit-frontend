// src/components/chatbot/ChatWindow.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './ChatWindow.module.css'
import ChatMessage from './ChatMessage'
import { useChatbot } from '@/models/ai/tanstack-query/useChatbot'

type Props = { open: boolean; }
type Msg = { id: string; role: 'bot' | 'user'; text: string }

const seed: Msg[] = [
  {
    id: 'm1',
    role: 'bot',
    text: '안녕하세요 고객님! 테킷 고객센터 챗봇입니다.\n무엇을 도와드릴까요?',
  },
]

const BOTTOM_TOLERANCE = 48 // 바닥으로 간주할 여유 픽셀

const ChatWindow: React.FC<Props> = ({ open }) => {
  const [container] = useState(() => document.createElement('div'))
  const [msgs, setMsgs] = useState<Msg[]>(seed)
  const [input, setInput] = useState('')

  const bodyRef = useRef<HTMLDivElement>(null) // ✅ 채팅 스크롤 영역
  const bottomRef = useRef<HTMLDivElement>(null) // ✅ 맨 아래 앵커
  const [isAtBottom, setIsAtBottom] = useState(true) // ✅ 바닥 근처 여부

  const { mutateAsync, isPending } = useChatbot()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    container.setAttribute('data-tiki-portal', 'true')
    document.body.appendChild(container)
    return () => {
      document.body.removeChild(container)
    }
  }, [container])

  useEffect(() => {
    if (!open) return
    // 창 열리면 포커스
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [open])

  // ✅ 스크롤 위치 추적
  useEffect(() => {
    const el = bodyRef.current
    if (!el) return

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const dist = scrollHeight - (scrollTop + clientHeight)
      setIsAtBottom(dist <= BOTTOM_TOLERANCE)
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    // 초기에도 한 번 계산
    onScroll()
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // ✅ msgs 변경 시 자동 스크롤: 바닥 근처거나, 방금 유저가 보낸 경우
  useEffect(() => {
    const last = msgs[msgs.length - 1]
    const shouldStick = isAtBottom || last?.role === 'user' // 내가 보낸 직후엔 무조건 내려주기

    if (open && shouldStick) {
      // 레이아웃 업데이트 이후 스크롤 보정
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      })
    }
  }, [msgs, isAtBottom, open])

  const send = async () => {
    const q = input.trim()
    if (!q || isPending) return

    // 유저 메시지 추가
    setMsgs((m) => [...m, { id: crypto.randomUUID(), role: 'user', text: q }])
    setInput('')

    // ✅ 전송 직후 즉시 포커스 복구
    requestAnimationFrame(() => inputRef.current?.focus())

    try {
      const answer = await mutateAsync(q)
      setMsgs((m) => [...m, { id: crypto.randomUUID(), role: 'bot', text: answer }])
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || '챗봇 호출 중 오류가 발생했어요.'
      setMsgs((m) => [...m, { id: crypto.randomUUID(), role: 'bot', text: msg }])
    } finally {
      // 혹시 모를 포커스 유실 대비
      requestAnimationFrame(() => inputRef.current?.focus())
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
        </header>

        {/* ✅ ref 연결 */}
        <div ref={bodyRef} className={styles.body}>
          {msgs.map((m) => (
            <ChatMessage key={m.id} role={m.role} name={m.role} text={m.text} />
          ))}
          <div ref={bottomRef} /> {/* ✅ 스크롤 앵커 */}
          {isPending && (
            <div style={{ fontSize: 12, opacity: 0.7, color: '#64748b' }}>답변 생성 중…</div>
          )}
        </div>

        <footer className={styles.footer}>
          <div className={styles.inputBar}>
            <input
              ref={inputRef}
              className={styles.input}
              placeholder="메시지를 입력하세요."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') send()
              }} // ✅ IME 중복 방지
              disabled={isPending}
            />
            <button
              className={styles.sendBtn}
              onClick={() => {
                // ✅ 버튼 전송 후에도 포커스 유지
                send()
                requestAnimationFrame(() => inputRef.current?.focus())
              }}
              disabled={isPending || !input.trim()}
            >
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
