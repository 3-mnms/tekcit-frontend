// src/components/booking/TicketDeliverySelectSection.tsx
import React from 'react';

export type DeliveryMethod = 'QR' | 'PAPER';

type Props = {
  /** 제어모드: 값과 onChange를 함께 넘기면 외부에서 상태 관리 */
  value?: DeliveryMethod | null;
  onChange?: (v: DeliveryMethod) => void;

  /** 비제어모드: 내부에서 관리 (초기값만 지정) */
  defaultValue?: DeliveryMethod;

  name?: string;
  disabled?: boolean;
  className?: string;
};

const TicketDeliverySelectSection: React.FC<Props> = ({
  value,
  onChange,
  defaultValue,
  name = 'delivery',
  disabled = false,
  className = '',
}) => {
  const [internal, setInternal] = React.useState<DeliveryMethod | null>(defaultValue ?? null);
  const current = value ?? internal;

  const select = (v: DeliveryMethod) => {
    if (disabled) return;
    setInternal(v);
    onChange?.(v);
  };

  const itemCls = (active: boolean) =>
    `flex items-center gap-2 rounded-xl border p-3 cursor-pointer
     ${active ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-gray-400'}
     ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;

  return (
    <section className={`w-full rounded-2xl border p-5 ${className}`}>
      <h2 className="mb-3 text-lg font-semibold">티켓 수령 방법</h2>

      <div role="radiogroup" aria-label="티켓 수령 방법" className="grid gap-2">
        <label className={itemCls(current === 'QR')}>
          <input
            type="radio"
            className="sr-only"
            name={name}
            checked={current === 'QR'}
            onChange={() => select('QR')}
            disabled={disabled}
          />
            <span className="text-sm font-medium">QR 코드(모바일)</span>
        </label>

        <label className={itemCls(current === 'PAPER')}>
          <input
            type="radio"
            className="sr-only"
            name={name}
            checked={current === 'PAPER'}
            onChange={() => select('PAPER')}
            disabled={disabled}
          />
            <span className="text-sm font-medium">지류 티켓(실물 티켓)</span>
        </label>
      </div>
    </section>
  );
};

export default TicketDeliverySelectSection;
