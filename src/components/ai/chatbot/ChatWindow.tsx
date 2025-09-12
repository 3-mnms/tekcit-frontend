import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './ChatWindow.module.css'
import ChatMessage from './ChatMessage'
import { useChatbot } from '@/models/ai/tanstack-query/useChatbot'

type Props = { open: boolean }
type Msg = { id: string; role: 'bot' | 'user'; text: string }

const seed: Msg[] = [
  {
    id: 'm1',
    role: 'bot',
    text: '안녕하세요 고객님! 테킷 고객센터 챗봇입니다.\n무엇을 도와드릴까요?',
  },
]

const BOTTOM_TOLERANCE = 48

const ChatWindow: React.FC<Props> = ({ open }) => {
  const [container] = useState(() => document.createElement('div'))
  const [msgs, setMsgs] = useState<Msg[]>(seed)
  const [input, setInput] = useState('')

  const bodyRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [isAtBottom, setIsAtBottom] = useState(true)
  const { mutateAsync, isPending } = useChatbot()

  useEffect(() => {
    container.setAttribute('data-tiki-portal', 'true')
    document.body.appendChild(container)
    return () => {
      document.body.removeChild(container)
    }
  }, [container])

  useEffect(() => {
    if (!open) return
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [open])

  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const dist = scrollHeight - (scrollTop + clientHeight)
      setIsAtBottom(dist <= BOTTOM_TOLERANCE)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const last = msgs[msgs.length - 1]
    const shouldStick = isAtBottom || last?.role === 'user'
    if (open && shouldStick) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      })
    }
  }, [msgs, isAtBottom, open])

  const send = async () => {
    const q = input.trim()
    if (!q || isPending) return

    setMsgs((m) => [...m, { id: crypto.randomUUID(), role: 'user', text: q }])
    setInput('')

    requestAnimationFrame(() => inputRef.current?.focus())

    try {
      const answer = await mutateAsync(q) // ← string 보장
      setMsgs((m) => [...m, { id: crypto.randomUUID(), role: 'bot', text: answer }])
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || '챗봇 호출 중 오류가 발생했어요.'
      setMsgs((m) => [...m, { id: crypto.randomUUID(), role: 'bot', text: msg }])
    } finally {
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

        <div ref={bodyRef} className={styles.body}>
          {msgs.map((m) => (
            <ChatMessage key={m.id} role={m.role} text={m.text} />
          ))}
          {isPending && (
            <div
              className={styles.pendingRow}
              role="status"
              aria-live="polite"
              aria-label="답변 생성 중"
            >
              <span className={styles.spinner} aria-hidden="true" />
              <span className={styles.srOnly}>답변 생성 중…</span>
            </div>
          )}
          <div ref={bottomRef} />
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
                if (e.key === 'Enter') {
                  // ← IME 중복 방지
                  e.preventDefault()
                  send()
                }
              }}
              disabled={isPending}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
            <button
              className={styles.sendBtn}
              onClick={() => {
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
