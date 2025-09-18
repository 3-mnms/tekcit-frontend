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
const ANIM_MS = 220

const ChatWindow: React.FC<Props> = ({ open }) => {
  const [container] = useState(() => document.createElement('div'))
  const [msgs, setMsgs] = useState<Msg[]>(seed)
  const [input, setInput] = useState('')

  const bodyRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const [isAtBottom, setIsAtBottom] = useState(true)
  const { mutateAsync, isPending } = useChatbot()

  const [visible, setVisible] = useState(open)
  const [phase, setPhase] = useState<'open' | 'close' | 'idle'>('idle')

  useEffect(() => {
    container.setAttribute('data-tiki-portal', 'true')
    document.body.appendChild(container)
    return () => {
      document.body.removeChild(container)
    }
  }, [container])

  useEffect(() => {
    if (open) {
      setVisible(true)
      requestAnimationFrame(() => setPhase('open'))
    } else {
      setPhase('close')
      const t = setTimeout(() => setVisible(false), ANIM_MS)
      return () => clearTimeout(t)
    }
  }, [open])

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

  const autoSize = () => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px` // 최대 160px까지만 키우기
  }

  useEffect(() => {
    autoSize()
  }, [input])

  const send = async () => {
    const q = input.trim()
    if (!q || isPending) return

    setMsgs((m) => [...m, { id: crypto.randomUUID(), role: 'user', text: q }])
    setInput('')
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.style.height = 'auto' // 초기화
        inputRef.current.focus()
      }
    })

    try {
      const answer = await mutateAsync(q)
      setMsgs((m) => [...m, { id: crypto.randomUUID(), role: 'bot', text: answer }])
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || '챗봇 호출 중 오류가 발생했어요.'
      setMsgs((m) => [...m, { id: crypto.randomUUID(), role: 'bot', text: msg }])
    } finally {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }

  const content = visible ? (
    <div
      className={`${styles.wrap} ${
        phase === 'open' ? styles.enter : phase === 'close' ? styles.exit : ''
      }`}
      role="dialog"
      aria-label="Tiki chat window"
      aria-hidden={!open}
    >
      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.title}>
            <span className={styles.brand}>Tiki - AI</span>
            <span className={styles.subtitle}>tekcit 고객센터 HAIKU 챗봇</span>
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
            <textarea
              ref={inputRef}
              className={styles.textarea} // ⬅️ 클래스명 변경
              placeholder="메시지를 입력하세요."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onInput={autoSize}
              onKeyDown={(e) => {
                // Shift+Enter = 줄바꿈, Enter 단독 = 전송
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              disabled={isPending}
              rows={1}
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
