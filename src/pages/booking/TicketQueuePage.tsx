import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import WaitingQueue from '@/components/booking/waiting/WaitingQueue';
import styles from './TicketQueuePage.module.css';
import { useFestivalDetail } from '@/models/festival/tanstack-query/useFestivalDetail';

const SMALL_W = 480;
const SMALL_H = 720;
const BOOKING_INNER_W = 1000;
const BOOKING_INNER_H = 600;

/** 내부크기 기준 정확 리사이즈 + 중앙 이동 */
const centerAndResizeExact = (targetInnerW: number, targetInnerH: number) => {
  try {
    const dw = Math.max(0, window.outerWidth - window.innerWidth);
    const dh = Math.max(0, window.outerHeight - window.innerHeight);

    const targetOuterW = Math.round(targetInnerW + dw);
    const targetOuterH = Math.round(targetInnerH + dh);

    const availLeft = (screen as any).availLeft ?? 0;
    const availTop  = (screen as any).availTop  ?? 0;
    const availW    = screen.availWidth ?? screen.width;
    const availH    = screen.availHeight ?? screen.height;

    const left = Math.max(availLeft, Math.round(availLeft + (availW - targetOuterW) / 2));
    const top  = Math.max(availTop,  Math.round(availTop  + (availH - targetOuterH) / 2));

    window.resizeTo(targetOuterW, targetOuterH);
    window.moveTo(left, top);
  } catch {}
};

const TicketQueuePage: React.FC = () => {
  const { fid } = useParams<{ fid: string }>();
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  const { data: detail } = useFestivalDetail(fid ?? '');
  const title = (detail as any)?.prfnm || (detail as any)?.title || '공연';

  const date = sp.get('date') ?? '';
  const time = sp.get('time') ?? '';
  const fdfrom = sp.get('fdfrom') ?? '';
  const fdto = sp.get('fdto') ?? '';
  const initialWN = Number(sp.get('wn') ?? '0');
  const posterUrl =
    (detail as any)?.poster ||
    (detail as any)?.posterUrl ||
    (detail as any)?.posterPath ||
    (detail as any)?.mainImg ||
    (detail as any)?.img ||
    undefined;

  const TOTAL_AHEAD = Math.max(0, Number.isFinite(initialWN) ? initialWN : 0);
  const [ahead, setAhead] = React.useState(TOTAL_AHEAD);
  const navigatedRef = React.useRef(false);

  /** resize 가드 해제 함수 보관 */
  const removeResizeGuardRef = React.useRef<(() => void) | null>(null);

  // 마운트 시 대기열 사이즈, 언마운트 시 예매 사이즈
  React.useEffect(() => {
    centerAndResizeExact(SMALL_W, SMALL_H);
    return () => centerAndResizeExact(BOOKING_INNER_W, BOOKING_INNER_H);
  }, []);

  // 사이즈 가드: 대기열 동안 480×720 유지
  React.useEffect(() => {
    // 최초 보정 2회(즉시 + 레이아웃 이후)
    centerAndResizeExact(SMALL_W, SMALL_H);
    const t = setTimeout(() => centerAndResizeExact(SMALL_W, SMALL_H), 0);

    let locking = false;
    const guard = () => {
      if (locking) return;
      locking = true;
      setTimeout(() => {
        centerAndResizeExact(SMALL_W, SMALL_H);
        locking = false;
      }, 0);
    };
    window.addEventListener('resize', guard);

    // 해제 함수 저장
    removeResizeGuardRef.current = () => window.removeEventListener('resize', guard);

    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', guard);
      removeResizeGuardRef.current = null;
    };
  }, []);

  // 더미 감소 타이머 (실제에선 서버 폴링/소켓으로 대체)
  React.useEffect(() => {
    const itv = setInterval(() => {
      setAhead((n) => Math.max(0, n - Math.floor(Math.random() * 5 + 1)));
    }, 1000);
    return () => clearInterval(itv);
  }, []);

  // 0명 되면 guard 해제 → 1000×600 보정 → navigate
  React.useEffect(() => {
    if (!fid || navigatedRef.current) return;
    if (ahead === 0) {
      navigatedRef.current = true;

      // 1) guard 해제
      removeResizeGuardRef.current?.();
      removeResizeGuardRef.current = null;

      // 2) 예매 사이즈로 연속 보정
      centerAndResizeExact(BOOKING_INNER_W, BOOKING_INNER_H);
      setTimeout(() => centerAndResizeExact(BOOKING_INNER_W, BOOKING_INNER_H), 0);
      setTimeout(() => centerAndResizeExact(BOOKING_INNER_W, BOOKING_INNER_H), 150);

      // 3) 이동
      const params = new URLSearchParams();
      if (date) params.set('date', date);
      if (time) params.set('time', time);
      if (fdfrom) params.set('fdfrom', fdfrom);
      if (fdto) params.set('fdto', fdto);

      navigate(`/booking/${fid}?${params.toString()}`);
    }
  }, [ahead, fid, navigate, date, time, fdfrom, fdto]);

  const progress =
    TOTAL_AHEAD === 0 ? 100 : Math.min(100, Math.max(0, ((TOTAL_AHEAD - ahead) / TOTAL_AHEAD) * 100));

  return (
    <div className={styles.page}>
      {/* 헤더 제거 */}
      <main className={styles.center}>
        <div className={styles.fullwrap}>
          <WaitingQueue
            title={title}
            dateTime={date ? `${date}${time ? ' ' + time : ''}` : '일정 미지정'}
            waitingCount={ahead}
            progressPct={Math.max(2, Math.round(progress))} // 최소 2%
            posterUrl={posterUrl}
          />
        </div>
      </main>
    </div>
  );
};

export default TicketQueuePage;
