// src/pages/mypage/ticket/transfer/TransferTicketPage.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import styles from './TransferTicketPage.module.css';
import { useNavigate } from 'react-router-dom';
import { useTicketsQuery, useTicketDetailQuery } from '@/models/my/ticket/tanstack-query/useTickets';
import {
  useWatchTransferQuery,
  useRespondFamilyTransfer,
  useRespondOthersTransfer,
} from '@/models/transfer/tanstack-query/useTransfer';

import BeforeTransferTicket from '@/components/my/ticket/BeforeTransferTicket';
import AfterTransferTicket from '@/components/my/ticket/AfterTransferTicket';

export const TRANSFER_DONE_EVENT = 'ticket:transferred';

/** 포스터만 얇게 */
const TicketPoster: React.FC<{ reservationNumber: string; alt: string; className?: string }> = ({
  reservationNumber,
  alt,
  className,
}) => {
  const { data } = useTicketDetailQuery(reservationNumber);
  const src = data?.posterFile || '/dummy-poster.jpg';
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = '/dummy-poster.jpg';
      }}
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

/** 서버 타입 → '가족' | '지인' 라벨 */
const toRelationLabel = (t: unknown): '가족' | '지인' => {
  if (typeof t === 'number') return t === 0 ? '가족' : '지인';
  if (typeof t === 'string') {
    const v = t.trim().toUpperCase();
    if (v === 'FAMILY' || v === '0') return '가족';
    if (v === 'OTHERS' || v === '1') return '지인';
  }
  return '지인';
};
/** 서버 타입 정규화 (엔드포인트 분기용) */
const toType = (t: unknown): 'FAMILY' | 'OTHERS' => {
  if (typeof t === 'number') return t === 0 ? 'FAMILY' : 'OTHERS';
  if (typeof t === 'string') {
    const v = t.trim().toUpperCase();
    if (v === 'FAMILY' || v === '0') return 'FAMILY';
    if (v === 'OTHERS' || v === '1') return 'OTHERS';
  }
  return 'OTHERS';
};

type InboxItem = {
  transferId?: number; // ✅ 수락/거절 요청에 필요 (UpdateTicketRequestDTO)
  senderId: number;
  senderName: string;
  type?: 'FAMILY' | 'OTHERS' | string | number;
  transferType?: 'FAMILY' | 'OTHERS' | string | number;
  createdAt: string;
  status: string;
  fname: string;
  posterFile: string;
  fcltynm: string;
  ticketPrice: number;
  performanceDate: string;
  selectedTicketCount: number;
};

const TransferTicketPage: React.FC = () => {
  const navigate = useNavigate();

  /** 내 보유 티켓 */
  const { data: myTickets } = useTicketsQuery();

  /** 양도요청 수신함 */
  const {
    data: inbox,
    isLoading: inboxLoading,
    isError: inboxError,
    error: inboxErr,
  } = useWatchTransferQuery();

  /** 수락/거절 훅 */
  const respondFamily = useRespondFamilyTransfer();
  const respondOthers = useRespondOthersTransfer();

  /** 버튼 로딩 제어 (아이템 단위) */
  const [pendingId, setPendingId] = useState<number | null>(null);

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

  /** 공통 응답 핸들러 */
  const handleRespond = useCallback(
    async (item: InboxItem, decision: 'ACCEPTED' | 'REJECTED') => {
      const transferId = (item as any).transferId as number | undefined;
      const tType = toType((item as any).type ?? (item as any).transferType);

      if (!transferId) {
        alert('transferId가 없어 응답을 보낼 수 없어요. watch 응답에 transferId를 포함해 주세요!');
        return;
      }
      if (pendingId) return;
      setPendingId(transferId);

      try {
        const body = {
          transferId,
          senderId: item.senderId,
          transferStatus: decision,
          // (필요 시) deliveryMethod/address 추가 가능
        } as const;

        if (tType === 'FAMILY') {
          await respondFamily.mutateAsync(body);
          alert(decision === 'ACCEPTED' ? '가족 양도를 수락했어요.' : '가족 양도를 거절했어요.');
        } else {
          await respondOthers.mutateAsync(body);
          if (decision === 'ACCEPTED') {
            // ✅ 결제 라우트만 이동(추가 전달값 불필요)
            navigate('/payment/transfer');
          } else {
            alert('지인 양도를 거절했어요.');
          }
        }
      } catch (e: any) {
        alert(e?.message ?? '요청 처리 중 오류가 발생했어요.');
      } finally {
        setPendingId(null);
      }
    },
    [navigate, pendingId, respondFamily, respondOthers]
  );

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
          const inboxItems: InboxItem[] = Array.isArray(inbox) ? (inbox as any).filter(Boolean) : [];
          const hasInbox = !inboxLoading && !inboxError && inboxItems.length > 0;

          if (!hasInbox) return null;

          return (
            <>
              <div className={styles.receivedList}>
                {inboxItems.map((it, idx) => {
                  const rel = toRelationLabel((it as any).type ?? (it as any).transferType);
                  const isBusy = pendingId != null && pendingId === (it as any).transferId;

                  return (
                    <AfterTransferTicket
                      key={`${(it as any).transferId ?? `${it.senderId}-${it.createdAt}`}-${idx}`}
                      title={it.fname}
                      date={fmtDate(it.performanceDate)}
                      time={fmtTime(it.performanceDate)}
                      relation={rel}
                      status={String(it.status)}
                      posterUrl={it.posterFile}
                      price={it.ticketPrice}
                      count={it.selectedTicketCount}
                      onAccept={() => handleRespond(it, 'ACCEPTED')}
                      onReject={() => handleRespond(it, 'REJECTED')}
                      acceptDisabled={isBusy}
                      rejectDisabled={isBusy}
                    />
                  );
                })}
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
          <BeforeTransferTicket key={t.reservationNumber} item={t} onTransfer={handleTransfer} />
        ))}

        {visibleTickets.length === 0 && <div className={styles.empty}>양도 가능한 티켓이 없어요.</div>}
      </div>
    </div>
  );
};

export default TransferTicketPage;
