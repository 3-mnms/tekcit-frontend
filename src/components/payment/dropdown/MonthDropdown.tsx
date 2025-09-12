// 주석: 완전 커스텀 드롭다운(목록까지 내 스타일로) 멍
import { useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import styles from './MonthDropdown.module.css'

const MonthSchema = z.string().regex(/^\d{4}-\d{2}$/) // 주석: YYYY-MM 형식 검증 멍

type Opt = { value: string; label: string }
type Props = {
  value: string                          // 주석: 선택 값(YYYY-MM) 멍
  onChange: (v: string) => void          // 주석: 변경 콜백 멍
  options: Opt[]                         // 주석: 월 옵션 리스트 멍
  placeholder?: string
}

export default function MonthDropdown({ value, onChange, options, placeholder = '월 선택' }: Props) {
  const [open, setOpen] = useState(false)           // 주석: 목록 열림 상태 멍
  const [focusIdx, setFocusIdx] = useState<number>(-1) // 주석: 키보드 포커스 인덱스 멍
  const rootRef = useRef<HTMLDivElement | null>(null)

  // 주석: 표시 라벨 계산 멍
  const label = useMemo(() => options.find(o => o.value === value)?.label ?? placeholder, [options, value, placeholder])

  // 주석: 외부 클릭 시 닫기 멍
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // 주석: 키보드 조작 멍
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault(); setOpen(true); setFocusIdx(Math.max(0, options.findIndex(o => o.value === value)))
      return
    }
    if (!open) return
    if (e.key === 'Escape') { setOpen(false); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusIdx(i => Math.min(options.length - 1, (i < 0 ? 0 : i + 1))) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setFocusIdx(i => Math.max(0, (i < 0 ? 0 : i - 1))) }
    if (e.key === 'Enter') {
      e.preventDefault()
      const pick = options[focusIdx]
      if (pick) {
        const parsed = MonthSchema.safeParse(pick.value) // 주석: zod 검증 멍
        if (parsed.success) onChange(parsed.data)
        setOpen(false)
      }
    }
  }

  // 주석: 항목 클릭 멍
  const pick = (v: string) => {
    const parsed = MonthSchema.safeParse(v)
    if (!parsed.success) return
    onChange(parsed.data); setOpen(false)
  }

  return (
    <div ref={rootRef} className={styles.select} data-open={open} onKeyDown={onKeyDown}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <span className={styles.label}>{label}</span>
        <span className={styles.caret} aria-hidden>▾</span>
      </button>

      {open && (
        <ul role="listbox" className={styles.menu}>
          {options.map((o, i) => {
            const selected = o.value === value
            const focused = i === focusIdx
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={selected}
                className={`${styles.item} ${selected ? styles.selected : ''} ${focused ? styles.focused : ''}`}
                onMouseEnter={() => setFocusIdx(i)}
                onClick={() => pick(o.value)}
              >
                {o.label}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
