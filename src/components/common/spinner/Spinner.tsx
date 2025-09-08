// src/components/common/spinner/Spinner.tsx
import { useMemo } from 'react'
import { z } from 'zod'
import styles from './Spinner.module.css'

// 주석: 스피너 문구 검증 스키마 (선택값, 공백만 있는 문자열은 허용하지 않음)
const SpinnerTextSchema = z.object({
  text: z.string().trim().min(1).optional(),
})

type SpinnerProps = z.infer<typeof SpinnerTextSchema>

/** 풀스크린 스피너 컴포넌트 */
export default function Spinner(props: SpinnerProps) {
  // 주석: 런타임에서도 방어적으로 props 검증
  const parsed = SpinnerTextSchema.safeParse(props)
  const text = useMemo(() => (parsed.success ? parsed.data.text : undefined), [parsed])

  return (
    <div className={styles.container} role="status" aria-live="polite" aria-busy="true">
      <div className={styles.spinner} aria-hidden="true" />
      {text && <p className={styles.text}>{text}</p>}
      <span className="sr-only">Loading...</span>
    </div>
  )
}
