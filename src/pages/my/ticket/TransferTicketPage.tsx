import React, { useEffect, useMemo, useState, useCallback } from 'react';
import styles from './TransferTicketPage.module.css';
import { useNavigate } from 'react-router-dom';
import { useTransferTicketsQuery, useTicketDetailQuery } from '@/models/my/ticket/tanstack-query/useTickets';
import {
  useWatchTransferQuery,
  useRespondFamilyTransfer,
  useRespondOthersTransfer,
  useTransferor, // ✅ 내 userId 확보
} from '@/models/transfer/tanstack-query/useTransfer';

import BeforeTransferTicket from '@/components/my/ticket/BeforeTransferTicket';
import AfterTransferTicket from '@/components/my/ticket/AfterTransferTicket';

export const TRANSFER_DONE_EVENT = 'ticket:transferred';

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
/** 서버 타입 정규화 (엔드포인트/관계 전달용) */
const toType = (t: unknown): 'FAMILY' | 'OTHERS' => {
  if (typeof t === 'number') return t === 0 ? 'FAMILY' : 'OTHERS';
  if (typeof t === 'string') {
    const v = t.trim().toUpperCase();
    if (v === 'FAMILY' || v === '0') return 'FAMILY';
    if (v === 'OTHERS' || v === '1') return 'OTHERS';
  }
  return 'OTHERS';
};

/** 서버 상태 enum(0~3 또는 문자열) → 문자열 정규화 */
const normalizeServerStatus = (v: unknown): 'REQUESTED' | 'APPROVED' | 'COMPLETED' | 'CANCELED' => {
  if (typeof v === 'number') {
    return (['REQUESTED', 'APPROVED', 'COMPLETED', 'CANCELED'][v] ?? 'REQUESTED') as any;
  }
  if (typeof v === 'string') {
    const s = v.trim().toUpperCase();
    if (s === '0') return 'REQUESTED';
    if (s === '1') return 'APPROVED';
    if (s === '2') return 'COMPLETED';
    if (s === '3') return 'CANCELED';
    if (['REQUESTED', 'APPROVED', 'COMPLETED', 'CANCELED'].includes(s)) return s as any;
  }
  return 'REQUESTED';
};

/** ✅ 화면 표기용 라벨: REQUESTED/APPROVED → "양도 요청", COMPLETED → "양도 승인", CANCELED → "양도 거부" */
const toUiStatusLabel = (
  s: ReturnType<typeof normalizeServerStatus>
): '양도 요청' | '양도 승인' | '양도 거부' => {
  switch (s) {
    case 'REQUESTED':
    case 'APPROVED':
      return '양도 요청';
    case 'COMPLETED':
      return '양도 승인';
    case 'CANCELED':
      return '양도 거부';
    default:
      return '양도 요청';
  }
};

type InboxItem = {
  transferId?: number;
  senderId: number;
  senderName: string;
  type?: 'FAMILY' | 'OTHERS' | string | number;
  transferType?: 'FAMILY' | 'OTHERS' | string | number;
  createdAt: string;
  status: string | number;
  reservationNumber: string;
  fname: string;            // 공연명
  posterFile: string;       // 포스터
  fcltynm: string;          // 장소
  ticketPrice: number;      // 단가
  performanceDate: string;  // ISO
  selectedTicketCount: number; // 매수
};

const TransferTicketPage: React.FC = () => {
  const navigate = useNavigate();

  /** 로그인 사용자 (userId 전달용) */
  const { data: me } = useTransferor({ enabled: true });

  /** 내 보유 티켓 */
  const { data: myTickets } = useTransferTicketsQuery();

  /** 양도요청 수신함 (거절/취소 포함 + userId 안전 전달) */
  const {
    data: inbox,
    isLoading: inboxLoading,
    isError: inboxError,
    error: inboxErr,
  } = useWatchTransferQuery({ userId: me?.userId, includeCanceled: true });

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

  /** 공통 응답 핸들러
   * - REJECTED: 즉시 API 호출( deliveryMethod/address = "키 자체 생략" )
   * - ACCEPTED: 즉시 결제 페이지로 이동하며 필수 값(state) 동반 전달
   */
  const handleRespond = useCallback(
    async (item: InboxItem, decision: 'ACCEPTED' | 'REJECTED') => {
      const transferId = (item as any).transferId as number | undefined;
      const tType = toType((item as any).type ?? (item as any).transferType);

      if (!transferId) {
        alert('transferId가 없어 응답을 보낼 수 없어요. watch 응답에 transferId를 포함해 주세요!');
        return;
      }
      if (pendingId) return;

      if (decision === 'ACCEPTED') {
        // ✅ 수락 시: 결제 페이지로 이동 + 결제/요약/상품정보에 필요한 state를 모두 전달
        setPendingId(transferId);

        const unitPrice = Number(item.ticketPrice) || 0;
        const count = Number(item.selectedTicketCount) || 0;
        const totalPrice = unitPrice * count;

        navigate('/payment/transfer', {
          state: {
            // 결제/검증에 필요한 값
            transferId,
            senderId: item.senderId,
            transferStatus: 'ACCEPTED' as const,
            relation: tType, // 'FAMILY' | 'OTHERS'

            // 🆕 BookingProductInfo & 요약 카드에서 쓸 상품정보
            title: item.fname,
            datetime: item.performanceDate,     // ISO 그대로 넘겨두고 렌더쪽에서 포맷
            location: item.fcltynm,
            ticket: count,                      // 매수
            price: unitPrice,                   // 단가 (지인일 때만 노출)
            totalPrice,                         // 총액 (지인 요약/결제에 사용)
            posterFile: item.posterFile,        // 필요시 썸네일 등에서 사용
            reservationNumber: item.reservationNumber,
          },
        });
        return;
      }

      // ❌ 거절 시: API 호출 (deliveryMethod/address "키 자체"를 보내지 않음)
      try {
        setPendingId(transferId);
        const minimal = {
          transferId,
          senderId: item.senderId,
          transferStatus: 'REJECTED' as const,
        };
        if (tType === 'FAMILY') {
          await respondFamily.mutateAsync(minimal);
        } else {
          await respondOthers.mutateAsync(minimal);
        }
        alert('양도 요청을 거절했어요.');
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
                  const normalizedStatus = normalizeServerStatus(it.status);
                  const uiStatus = toUiStatusLabel(normalizedStatus); // ✅ 라벨 생성

                  return (
                    <AfterTransferTicket
                      key={`${(it as any).transferId ?? `${it.senderId}-${it.createdAt}`}-${idx}`}
                      title={it.fname}
                      date={fmtDate(it.performanceDate)}
                      time={fmtTime(it.performanceDate)}
                      relation={rel}
                      status={normalizedStatus}           // 스타일/로직용
                      statusLabel={uiStatus}              // ✅ 화면 표시용
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
