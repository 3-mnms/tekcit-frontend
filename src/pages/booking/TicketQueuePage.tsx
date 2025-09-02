import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import WaitingQueue from '@/components/booking/waiting/WaitingQueue';
import styles from './TicketQueuePage.module.css';

import { useExitWaitingMutation } from '@/models/waiting/tanstack-query/useWaiting';
import { useFestivalDetail } from '@/models/festival/tanstack-query/useFestivalDetail';
import { useWaitingSocket } from '@/models/waiting/tanstack-query/useWaitingSocket';
import { useAuthStore } from '@/shared/storage/useAuthStore';

/** 안전 파라미터 추출 */
const useQueueParams = () => {
  const [sp] = useSearchParams();
  return {
    date: sp.get('date') || undefined,         // YYYY-MM-DD (표시용)
    time: sp.get('time') || undefined,         // HH:mm (표시용)
    rd: sp.get('rd') || undefined,             // ISO 예약시각 (백엔드 LocalDateTime)
    wn: sp.get('wn') || undefined,             // 초기 대기번호
    fdfrom: sp.get('fdfrom') || undefined,     // 기간 표시용
    fdto: sp.get('fdto') || undefined,
  };
};

const TicketQueuePage: React.FC = () => {
  const { fid } = useParams<{ fid: string }>();
  const navigate = useNavigate();
  const { date, time, rd, wn } = useQueueParams();

  // 액세스토큰/유저아이디(있으면 토픽에 붙이기)
  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.user?.id || s.userId || undefined);

  // 상세(포스터/제목 표시)
  const { data: detail } = useFestivalDetail(fid ?? '');

  // 현재 내 대기번호 (소켓 업데이트로 갱신)
  const [waitingNumber, setWaitingNumber] = React.useState<number | null>(
    wn ? Number(wn) : null
  );

  // 👉 토픽 경로는 서버 publish 경로에 맞게 조정해줘!
  // 예: /topic/waiting/{festivalId}/{reservationDate}/{userId?}
  const topic = React.useMemo(() => {
    if (!fid || !rd) return '';
    return userId
      ? `/topic/waiting/${fid}/${rd}/${userId}`
      : `/topic/waiting/${fid}/${rd}`;
  }, [fid, rd, userId]);

  // 웹소켓 구독 (실데이터)
  useWaitingSocket({
    wsEndpoint: import.meta.env.VITE_WS_ENDPOINT || '/ws',      // ← 백엔드 설정에 맞춰주세요
    topic,
    festivalId: String(fid ?? ''),
    reservationDate: rd ?? '',
    connectHeaders: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    onMessage: (msg) => {
      try {
        const data = JSON.parse(msg.body);
        // 예상: { userId, waitingNumber, immediateEntry, message }
        if (typeof data?.waitingNumber === 'number') {
          setWaitingNumber(data.waitingNumber);
        }
        if (data?.immediateEntry === true || data?.waitingNumber === 0) {
          setWaitingNumber(0);
        }
      } catch {
        // 서버가 단순 숫자만 보낼 수도 있으니 보조 처리
        const n = Number(msg.body);
        if (!Number.isNaN(n)) setWaitingNumber(n);
      }
    },
    debug: false,
  });

  // 대기번호 0 ⇒ 같은 팝업 창에서 /booking/:fid 로 자동 이동 (date/time 유지)
  React.useEffect(() => {
    if (!fid) return;
    if (waitingNumber === 0) {
      const qs = new URLSearchParams();
      if (date) qs.set('date', date);
      if (time) qs.set('time', time);
      navigate(`/booking/${fid}?${qs.toString()}`, { replace: true });
    }
  }, [waitingNumber, fid, date, time, navigate]);

  // 진행률: 총원 정보가 없다면 “대기중” 느낌으로 30% 고정 → 0엔 100%
  const progressPct = React.useMemo(() => {
    if (waitingNumber == null) return 30; // 아직 수신 전
    if (waitingNumber <= 0) return 100;
    // 총원 정보를 모르면 퍼센트 산정이 불가하므로 고정값으로 UX만 전달
    return 30;
  }, [waitingNumber]);

  // 대기열 나가기 (실서버 호출)
  const exitMut = useExitWaitingMutation();
  const handleExit = async () => {
    try {
      if (fid && rd) {
        await exitMut.mutateAsync({ festivalId: String(fid), reservationDate: rd });
      }
    } catch {
      // 실패해도 계속 진행
    } finally {
      window.close();
      setTimeout(() => {
        try {
          if (!window.closed) navigate('/', { replace: true });
        } catch {
          navigate('/', { replace: true });
        }
      }, 150);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>대기열 페이지</div>

      <div className={styles.center}>
        <WaitingQueue
          title={(detail as any)?.prfnm || (detail as any)?.name || '공연'}
          dateTime={time ? `${date ?? ''} ${time}` : (date ?? '-')}
          waitingCount={Math.max(0, waitingNumber ?? 0)}
          progressPct={progressPct}
          posterUrl={(detail as any)?.posterFile || (detail as any)?.posterUrl}
        />

        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleExit}
            className={styles.exitBtn}
            disabled={exitMut.isPending}
          >
            {exitMut.isPending ? '나가는 중…' : '대기열 나가기'}
          </button>

          <button
            type="button"
            className={styles.refreshBtn}
            onClick={() => window.location.reload()}
          >
            새로고침
          </button>
        </div>

        <p className={styles.notice}>
          창을 닫아도 대기열에서 자동 퇴장되지 않을 수 있어요. 반드시 “대기열 나가기”를 눌러주세요.
        </p>

        {/* 디버그 정보(원하면 숨겨도 됨) */}
        <pre className={styles.debug}>
          topic: {topic || '-'}{'\n'}
          waitingNumber: {waitingNumber ?? '-'}
        </pre>
      </div>
    </div>
  );
};

export default TicketQueuePage;
