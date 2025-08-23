// src/components/booking/TicketDeliverySelectSection.tsx
import React from 'react';

export type DeliveryMethod = 'QR' | 'PAPER';

type Props = {
  /** 제어모드: 값과 onChange를 함께 넘기면 외부에서 상태 관리 */
  value?: DeliveryMethod | null;
  onChange?: (v: DeliveryMethod | null) => void;

  /** 비제어모드: 내부에서 관리 (초기값만 지정) */
  defaultValue?: DeliveryMethod;

  name?: string;
  disabled?: boolean;
  className?: string;

  /** 백엔드/부모가 내려주는 사용 가능 옵션 (예: ['QR','PAPER'] 또는 ['QR'] 등). 미지정이면 둘 다 가능 */
  available?: DeliveryMethod[] | null;
  /** 로딩 시 스켈레톤/비활성화 처리 */
  loading?: boolean;
  /** 불가 옵션을 숨길지 여부 (기본: false -> 회색/비활성으로 표시) */
  hideUnavailable?: boolean;
};

const ALL: DeliveryMethod[] = ['QR', 'PAPER'];

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

  // 현재 선택이 불가로 바뀌면 선택 해제
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
    `flex items-center gap-2 rounded-xl border p-3 cursor-pointer transition
     ${active ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-gray-400'}
     ${(!allowed || disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}`;

  const renderItem = (m: DeliveryMethod, label: string) => {
    const allowed = isAllowed(m);
    if (hideUnavailable && !allowed) return null;

    return (
      <label key={m} className={itemCls(current === m, allowed)}>
        <input
          type="radio"
          className="sr-only"
          name={name}
          checked={current === m}
          onChange={() => select(m)}
          disabled={disabled || loading || !allowed}
        />
        <span className="text-sm font-medium">
          {label}
          {!allowed && !loading && <span className="ml-2 text-xs text-gray-500">(미지원)</span>}
        </span>
      </label>
    );
  };

  return (
    <section className={`w-full rounded-2xl border p-5 ${className}`}>
      <h2 className="mb-3 text-lg font-semibold">티켓 수령 방법</h2>

      {loading ? (
        <div className="grid gap-2">
          <div className="h-11 rounded-xl border animate-pulse" />
          <div className="h-11 rounded-xl border animate-pulse" />
        </div>
      ) : (
        <div role="radiogroup" aria-label="티켓 수령 방법" className="grid gap-2">
          {renderItem('QR', 'QR 코드(모바일)')}
          {renderItem('PAPER', '지류 티켓(실물 티켓)')}
        </div>
      )}
    </section>
  );
};

export default TicketDeliverySelectSection;
