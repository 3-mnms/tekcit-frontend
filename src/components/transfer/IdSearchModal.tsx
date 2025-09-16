import React, { useEffect, useRef, useState } from 'react'
import styles from './IdSearchModal.module.css'
import Button from '@/components/common/button/Button'
import { useSearchTransferee } from '@/models/transfer/tanstack-query/useTransfer'
import type { AxiosError } from 'axios';

export type AccountMini = { id: string; name: string; residentNum?: string; userId: number }

type Props = {
  open: boolean
  onClose: () => void
  onSelect: (acc: AccountMini) => void
}

type TransfereeCore = {
  name?: string
  residentNum?: string
  userId?: number
}

type Envelope = {
  success?: boolean
  data?: TransfereeCore | null
  message?: string
}

function isTransfereeCore(v: unknown): v is TransfereeCore {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  const userIdOk =
    o.userId === undefined || typeof o.userId === 'number' || Number.isFinite(Number(o.userId))
  const nameOk = o.name === undefined || typeof o.name === 'string'
  const rnOk = o.residentNum === undefined || typeof o.residentNum === 'string'
  return userIdOk && nameOk && rnOk
}

function isEnvelope(v: unknown): v is Envelope {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return 'data' in o
}

const IdSearchModal: React.FC<Props> = ({ open, onClose, onSelect }) => {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<AccountMini[]>([])
  const [sel, setSel] = useState<number>(-1)

  const emailRef = useRef<HTMLInputElement>(null)
  const prevFocusRef = useRef<HTMLElement | null>(null)

  const { mutateAsync, isPending } = useSearchTransferee()

  useEffect(() => {
    if (!open) return
    prevFocusRef.current = (document.activeElement as HTMLElement) ?? null
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    setTimeout(() => emailRef.current?.focus(), 0)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      prevFocusRef.current?.focus?.()
      setQ('')
      setResults([])
      setSel(-1)
    }
  }, [open, onClose])

  const validEmail = (s: string) => /\S+@\S+\.\S+/.test(s)

  const doSearch = async () => {
    const email = q.trim()
    if (!validEmail(email)) {
      alert('이메일 형식으로 입력해 주세요')
      return
    }
    try {
      // mutateAsync의 반환을 unknown으로 보고 안전하게 파싱
      const payload = (await mutateAsync(email)) as unknown

      let core: TransfereeCore | null = null
      if (isEnvelope(payload)) {
        core = payload.data ?? null
      } else if (isTransfereeCore(payload)) {
        core = payload
      }

      const list: AccountMini[] = core
        ? [
            {
              id: email,
              name: (core.name ?? '').trim(),
              residentNum: (core.residentNum ?? '').trim() || undefined,
              userId:
                typeof core.userId === 'number'
                  ? core.userId
                  : Number.isFinite(Number(core.userId))
                    ? Number(core.userId)
                    : 0,
            },
          ]
        : []

      setResults(list)
      setSel(list.length ? 0 : -1)
      if (!list.length) alert('일치하는 결과가 없습니다')
    } catch (e: unknown) {
      let msg = '검색 중 오류가 발생했어요'

      if (typeof e === 'object' && e) {
        // axios 에러라면
        const axiosErr = e as AxiosError<{ errorCode?: string; errorMessage?: string }>
        if (axiosErr.response?.data?.errorMessage) {
          msg = axiosErr.response.data.errorMessage
        } else if (axiosErr.message) {
          msg = axiosErr.message
        }
      }

      console.error('[doSearch error]', e)
      alert(msg)
      setResults([])
      setSel(-1)
    }
  }

  const confirm = () => {
    if (sel < 0) return
    onSelect(results[sel])
    onClose()
  }

  if (!open) return null

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        {/* ===== 상단 헤더 줄 + X 버튼 ===== */}
        <div className={styles.topBar}>
          <span aria-hidden="true" />
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="닫기"
            title="닫기"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className={styles.title}>이메일로 계정 검색</div>

        {/* 🔧 전역 label 충돌 방지: fieldLabel 클래스로 한정 */}
        <label className={styles.fieldLabel}>
          <span className={styles.srOnly}>검색할 이메일</span>
          <div className={styles.searchRow}>
            <input
              ref={emailRef}
              className={`${styles.input} ${styles.inputAttached}`}
              placeholder="example@domain.com"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doSearch()}
              disabled={isPending}
              aria-label="검색할 이메일"
            />
            <Button
              type="button"
              className={`${styles.searchBtn} rounded-l-none px-4`}
              onClick={doSearch}
              disabled={isPending}
            >
              {isPending ? '검색중…' : '검색'}
            </Button>
          </div>
        </label>

        {/* 결과: 라디오 한 줄 + 이름 / 주민번호 */}
        <div className={styles.resultBox}>
          {results.length ? (
            <div
              role="radiogroup"
              aria-label="계정 선택"
              className={styles.resultList}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setSel((s) => Math.min(s + 1, results.length - 1))
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setSel((s) => Math.max(s - 1, 0))
                }
                if (e.key === 'Enter' && sel >= 0) confirm()
              }}
            >
              {results.map((r, i) => (
                <label
                  key={`${r.id}-${i}`}
                  className={`${styles.resultItem} ${sel === i ? styles.resultItemSel : ''}`}
                  role="radio"
                  aria-checked={sel === i}
                  onClick={() => setSel(i)}
                  onDoubleClick={confirm}
                >
                  <input
                    type="radio"
                    name="transferee"
                    className={styles.resultRadio}
                    checked={sel === i}
                    onChange={() => setSel(i)}
                  />
                  <div className={styles.resultTextWrap}>
                    <span className={styles.resultText}>
                      {r.name && r.name.trim() ? r.name : '(이름 없음)'}
                      {' / '}
                      {r.residentNum && r.residentNum.trim() ? r.residentNum : '-'}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className={styles.resultHint}>
              {isPending ? '검색 중…' : '검색 결과가 여기에 표시됩니다.'}
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            className={`${styles.confirmBtn} px-5`}
            onClick={confirm}
            disabled={sel < 0 || isPending}
          >
            확인
          </Button>
        </div>
      </div>
    </div>
  )
}

export default IdSearchModal
