import React from 'react'
import styles from './TicketDeliverySelectSection.module.css'
import Spinner from '../common/spinner/Spinner'
export type DeliveryMethod = 'QR' | 'PAPER'

/** 백엔드 제공 코드: 1=둘 다, 2=QR만 */
export type DeliveryAvailabilityCode = 1 | 2

type Props = {
  value?: DeliveryMethod | null
  onChange?: (v: DeliveryMethod | null) => void
  defaultValue?: DeliveryMethod
  name?: string
  disabled?: boolean
  className?: string

  /** (기존) 직접 가능 옵션 지정. 있으면 이것이 최우선 */
  available?: DeliveryMethod[] | null

  /** (신규) 백엔드 코드로 가능 옵션 제어: 1=QR+PAPER, 2=QR만 */
  availabilityCode?: DeliveryAvailabilityCode | null

  loading?: boolean
  hideUnavailable?: boolean
}

const TicketDeliverySelectSection: React.FC<Props> = ({
  value,
  onChange,
  defaultValue,
  name = 'delivery',
  disabled = false,
  className = '',
  available = null,
  availabilityCode = null,
  loading = false,
  hideUnavailable = false,
}) => {
  const [internal, setInternal] = React.useState<DeliveryMethod | null>(defaultValue ?? null)
  const current = value ?? internal

  /** available이 있으면 최우선, 없으면 availabilityCode를 해석 */
  const resolvedAvailable = React.useMemo<DeliveryMethod[] | null>(() => {
    if (available && available.length > 0) return available
    if (availabilityCode === 1) return ['QR', 'PAPER']
    if (availabilityCode === 2) return ['QR']
    return null // null이면 둘 다 허용 취급
  }, [available, availabilityCode])

  const isAllowed = React.useCallback(
    (m: DeliveryMethod) => (resolvedAvailable ? resolvedAvailable.includes(m) : true),
    [resolvedAvailable],
  )

  // 허용 옵션이 바뀌었을 때 현재 선택이 불가해지면 리셋
  React.useEffect(() => {
    if (current && !isAllowed(current)) {
      setInternal(null)
      onChange?.(null)
    }
  }, [current, isAllowed, onChange])

  const select = (v: DeliveryMethod) => {
    if (disabled || loading || !isAllowed(v)) return
    setInternal(v)
    onChange?.(v)
  }

  const itemCls = (active: boolean, allowed: boolean) =>
    [
      styles.item,
      active && styles.itemActive,
      (!allowed || disabled || loading) && styles.itemDisabled,
    ]
      .filter(Boolean)
      .join(' ')

  const renderItem = (m: DeliveryMethod, label: string) => {
    const allowed = isAllowed(m)
    if (hideUnavailable && !allowed) return null

    return (
      <label key={m} className={itemCls(current === m, allowed)}>
        <input
          type="radio"
          className={styles.srOnly}
          name={name}
          checked={current === m}
          onChange={() => select(m)}
          disabled={disabled || loading || !allowed}
        />
        <span className={styles.labelText}>
          {label}
          {!allowed && !loading && <span className={styles.unavailableTag}>(미지원)</span>}
        </span>
      </label>
    )
  }

  return (
    <section className={`${styles.section} ${className}`}>
      <h2 className={styles.title}>티켓 수령 방법</h2>
      <div role="radiogroup" aria-label="티켓 수령 방법" className={styles.group}>
        {renderItem('QR', 'QR 코드(모바일)')}
        {renderItem('PAPER', '지류 티켓(실물 티켓)')}
      </div>
    </section>
  )
}

export default TicketDeliverySelectSection
