// MonthDropdown.tsx 수정버전
import { useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import styles from './MonthDropdown.module.css'

const MonthSchema = z.string().regex(/^\d{4}-\d{2}$/) // YYYY-MM 형식 검증

type Opt = { value: string; label: string }
type Props = {
  value: string                          
  onChange: (v: string) => void          
  options?: Opt[]                        // optional로 변경
  placeholder?: string
  months?: number                        // 몇 개월치 옵션을 만들지
}

export default function MonthDropdown({ 
  value, 
  onChange, 
  options, 
  placeholder = '월 선택',
  months = 6 
}: Props) {
  const [open, setOpen] = useState(false)
  const [focusIdx, setFocusIdx] = useState<number>(-1)
  const rootRef = useRef<HTMLDivElement | null>(null)

  // 옵션이 없으면 자동 생성
  const finalOptions = useMemo(() => {
    if (options && options.length > 0) return options
    
    // 자동으로 최근 N개월 옵션 생성
    return Array.from({ length: months }).map((_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = `${d.getMonth() + 1}월`
      return { value, label }
    })
  }, [options, months])

  // 표시 라벨 계산
  const label = useMemo(() => 
    finalOptions.find(o => o.value === value)?.label ?? placeholder, 
    [finalOptions, value, placeholder]
  )

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  // 키보드 조작
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      setOpen(true)
      setFocusIdx(Math.max(0, finalOptions.findIndex(o => o.value === value)))
      return
    }
    if (!open) return
    
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusIdx(i => Math.min(finalOptions.length - 1, (i < 0 ? 0 : i + 1)))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusIdx(i => Math.max(0, (i < 0 ? 0 : i - 1)))
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const pick = finalOptions[focusIdx]
      if (pick) {
        const parsed = MonthSchema.safeParse(pick.value)
        if (parsed.success) onChange(parsed.data)
        setOpen(false)
      }
    }
  }

  // 항목 클릭
  const handleSelect = (selectedValue: string) => {
    const parsed = MonthSchema.safeParse(selectedValue)
    if (!parsed.success) return
    onChange(parsed.data)
    setOpen(false)
  }

  return (
    <div 
      ref={rootRef} 
      className={styles.select} 
      data-open={open} 
      onKeyDown={onKeyDown}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(prev => !prev)}
      >
        <span className={styles.label}>{label}</span>
        <span className={styles.caret} aria-hidden>▾</span>
      </button>

      {open && (
        <ul role="listbox" className={styles.menu}>
          {finalOptions.map((option, index) => {
            const selected = option.value === value
            const focused = index === focusIdx
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={selected}
                className={`${styles.item} ${selected ? styles.selected : ''} ${focused ? styles.focused : ''}`}
                onMouseEnter={() => setFocusIdx(index)}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}