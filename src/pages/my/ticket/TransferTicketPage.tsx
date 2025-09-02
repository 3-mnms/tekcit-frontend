import React, { useEffect, useMemo, useState } from 'react';
import styles from './TransferTicketPage.module.css';
import { useNavigate } from 'react-router-dom';
import { useTicketsQuery, useTicketDetailQuery } from '@/models/my/ticket/tanstack-query/useTickets';
import { useWatchTransferQuery } from '@/models/transfer/tanstack-query/useTransfer';

import BeforeTransferTicket from '@/components/my/ticket/BeforeTransferTicket';
import AfterTransferTicket from '@/components/my/ticket/AfterTransferTicket';

export const TRANSFER_DONE_EVENT = 'ticket:transferred';

/** 포스터만 얇게 */
const TicketPoster: React.FC<{ reservationNumber: string; alt: string; className?: string; }> = ({ reservationNumber, alt, className }) => {
  const { data } = useTicketDetailQuery(reservationNumber);
  const src = data?.posterFile || '/dummy-poster.jpg';
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/dummy-poster.jpg'; }}
    />
  );
};

const fmtDate = (iso?: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const fmtTime = (iso?: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

/** 서버 transferType → '가족' | '지인' 라벨로 변환 (transferType만 사용) */
const toRelationLabel = (transferType: unknown): '가족' | '지인' => {
  if (typeof transferType === 'number') {
    return transferType === 0 ? '가족' : '지인';
  }
  if (typeof transferType === 'string') {
    const v = transferType.trim().toUpperCase();
    if (v === 'FAMILY' || v === '0') return '가족';
    if (v === 'OTHERS' || v === '1') return '지인';
  }
  return '지인';
};

const TransferTicketPage: React.FC = () => {
  const navigate = useNavigate();

  /** 내 보유 티켓 */
  const { data: myTickets } = useTicketsQuery();

  /** 양도요청 수신함 */
  const { data: inbox, isLoading: inboxLoading, isError: inboxError, error: inboxErr } = useWatchTransferQuery();

  const [hidden, setHidden] = useState<Set<string>>(new Set());
  useEffect(() => {
    const onDone = (ev: Event) => {
      const num = (ev as CustomEvent<string>).detail;
      setHidden((prev) => new Set(prev).add(num));
    };
    window.addEventListener(TRANSFER_DONE_EVENT, onDone as EventListener);
    return () => window.removeEventListener(TRANSFER_DONE_EVENT, onDone as EventListener);
  }, []);

  // 양도 가능한 티켓만
  const visibleTickets = useMemo(() => {
    const list = myTickets ?? [];
    return list.filter((t) => t.rawStatus === 'CONFIRMED' && !hidden.has(t.reservationNumber));
  }, [myTickets, hidden]);

  // 클릭 → 예약번호 파라미터로 페이지 이동
  const handleTransfer = (reservationNumber: string) => {
    navigate(`/mypage/ticket/transfer/${encodeURIComponent(reservationNumber)}`);
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>티켓 양도</h2>

      {/* === 양도받은 요청(수신함) === */}
      <div className={styles.receivedSection}>
        {inboxLoading && <div className={styles.empty}>불러오는 중…</div>}
        {inboxError && (
          <div className={styles.empty} role="alert" style={{ color: '#b91c1c' }}>
            조회 실패: {(inboxErr as any)?.message ?? '알 수 없는 오류'}
          </div>
        )}

        {(() => {
          const inboxItems = Array.isArray(inbox) ? inbox.filter(Boolean) : [];
          const hasInbox = !inboxLoading && !inboxError && inboxItems.length > 0;

          if (!hasInbox) return null; // ✅ 요청 없으면 아무것도 렌더 X

          return (
            <>
              <div className={styles.receivedList}>
                {inboxItems.map((it, idx) => (
                  <AfterTransferTicket
                    key={`${it.senderId}-${it.createdAt}-${idx}`}
                    title={it.fname}
                    date={fmtDate(it.performanceDate)}
                    time={fmtTime(it.performanceDate)}
                    relation={toRelationLabel((it as any).transferType)} // ✅ transferType만 사용
                    status={String(it.status)}
                    posterUrl={it.posterFile}
                    price={it.ticketPrice}
                    count={it.selectedTicketCount}
                    onAccept={() => alert('수락 기능 연결 예정')}
                    onReject={() => alert('거절 기능 연결 예정')}
                  />
                ))}
              </div>

              {/* ✅ 요청이 있을 때만 구분선 */}
              <hr className={styles.sectionDivider} />
            </>
          );
        })()}
      </div>

      {/* === 내가 보유한 티켓(양도하기) === */}
      <div className={styles.list}>
        {visibleTickets.map((t) => (
          <BeforeTransferTicket
            key={t.reservationNumber}
            item={t}
            onTransfer={handleTransfer}
          />
        ))}

        {visibleTickets.length === 0 && (
          <div className={styles.empty}>양도 가능한 티켓이 없어요.</div>
        )}
      </div>
    </div>
  );
};

export default TransferTicketPage;
