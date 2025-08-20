// src/components/reservation/TicketInfoSection.tsx
import React from 'react';

type TicketInfoSectionProps = {
  posterUrl?: string;
  title?: string;
  date?: string;
  time?: string;
  venue?: string;
  unitPrice?: number;
  quantity?: number;
  className?: string;
  compact?: boolean;   // ✅ 추가: 컴팩트 모드
};

const formatKRW = (n: number) => `${new Intl.NumberFormat('ko-KR').format(n)}원`;

const DUMMY = {
  posterUrl: 'https://picsum.photos/600/900?random=42',
  title: '그랜드 민트 페스티벌 2025',
  date: '2025-10-18(토)',
  time: '18:00',
  venue: '올림픽공원 88잔디마당',
  unitPrice: 120000,
  quantity: 2,
};

const TicketInfoSection: React.FC<TicketInfoSectionProps> = ({
  posterUrl = DUMMY.posterUrl,
  title = DUMMY.title,
  date = DUMMY.date,
  time = DUMMY.time,
  venue = DUMMY.venue,
  unitPrice = DUMMY.unitPrice,
  quantity = DUMMY.quantity,
  className = '',
  compact = false,
}) => {
  const subtotal = unitPrice * quantity;
  const fallbackSvg =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300">
        <rect width="200" height="300" fill="#e5e7eb"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
              font-size="14" fill="#6b7280">No Poster</text>
      </svg>`
    );

  // ✅ compact 모드 크기/폰트 축소
  const posterStyle = compact
    ? { width: 120, aspectRatio: '2 / 3' as any }  // 약 120×180
    : { width: '100%', aspectRatio: '2 / 3' as any };

  const titleCls = compact ? 'text-sm font-semibold truncate' : 'text-base font-medium';
  const metaCls  = compact ? 'text-xs opacity-80 truncate'   : 'text-sm opacity-80';

  return (
    <section className={`w-full rounded-2xl border p-4 ${className}`}>
      <h2 className={compact ? 'mb-2 text-sm font-semibold' : 'mb-4 text-lg font-semibold'}>내 티켓 정보</h2>

      <div className="flex gap-12">
        {/* 포스터 (compact면 고정폭) */}
        <div style={posterStyle} className="overflow-hidden rounded-lg border shrink-0">
          <img
            src={posterUrl || fallbackSvg}
            alt={`${title} 포스터`}
            className="h-full w-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackSvg; }}
            loading="lazy"
          />
        </div>

        {/* 정보 */}
        <div className="min-w-0 flex-1">
          <div className="grid gap-1">
            <div className={titleCls} title={title}>{title}</div>
            <div className={metaCls}  title={`${date} · ${time}`}>{date} · {time}</div>
            <div className={metaCls}  title={venue}>{venue}</div>
          </div>

          <div className="mt-3 grid gap-1 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="opacity-80">가격 × 수량</span>
              <span className="font-medium">{formatKRW(unitPrice)} × {quantity}매</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="opacity-80">소계</span>
              <span className="text-base font-semibold">{formatKRW(subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TicketInfoSection;
