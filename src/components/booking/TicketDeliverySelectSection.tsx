import React from 'react';
import styles from './TicketDeliverySelectSection.module.css';

export type DeliveryMethod = 'QR' | 'PAPER';

type Props = {
  value?: DeliveryMethod | null;
  onChange?: (v: DeliveryMethod | null) => void;
  defaultValue?: DeliveryMethod;
  name?: string;
  disabled?: boolean;
  className?: string;
  available?: DeliveryMethod[] | null;
  loading?: boolean;
  hideUnavailable?: boolean;
};

const TicketDeliverySelectSection: React.FC<Props> = ({
  value,
  onChange,
  defaultValue,
  name = 'delivery',
  disabled = false,
  className = '',
  available = null,
  loading = false,
  hideUnavailable = false,
}) => {
  const [internal, setInternal] = React.useState<DeliveryMethod | null>(defaultValue ?? null);
  const current = value ?? internal;

  const isAllowed = React.useCallback(
    (m: DeliveryMethod) => (available ? available.includes(m) : true),
    [available]
  );

  React.useEffect(() => {
    if (current && !isAllowed(current)) {
      setInternal(null);
      onChange?.(null);
    }
  }, [available, current, isAllowed, onChange]);

  const select = (v: DeliveryMethod) => {
    if (disabled || loading || !isAllowed(v)) return;
    setInternal(v);
    onChange?.(v);
  };

  const itemCls = (active: boolean, allowed: boolean) =>
    [
      styles.item,
      active && styles.itemActive,
      (!allowed || disabled || loading) && styles.itemDisabled,
    ]
      .filter(Boolean)
      .join(' ');

  const renderItem = (m: DeliveryMethod, label: string) => {
    const allowed = isAllowed(m);
    if (hideUnavailable && !allowed) return null;

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
    );
  };

  return (
    <section className={`${styles.section} ${className}`}>
      <h2 className={styles.title}>티켓 수령 방법</h2>

      {loading ? (
        <div className={styles.group}>
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
        </div>
      ) : (
        <div role="radiogroup" aria-label="티켓 수령 방법" className={styles.group}>
          {renderItem('QR', 'QR 코드(모바일)')}
          {renderItem('PAPER', '지류 티켓(실물 티켓)')}
        </div>
      )}
    </section>
  );
};

export default TicketDeliverySelectSection;