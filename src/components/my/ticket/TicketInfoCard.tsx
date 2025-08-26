// src/components/my/ticket/TicketInfoCard.tsx
import React, { useState } from 'react';
import styles from './TicketInfoCard.module.css';
import Modal from './QRModal';
import EntranceCheckModal from '@/components/my/ticket/EntranceCheckModal';

const TicketInfoCard: React.FC = () => {
  const deliveryMethod = '모바일 티켓';

  // ✅ 모달 2개를 별도 상태로 관리
  const [showQR, setShowQR] = useState(false);
  const [showEntrance, setShowEntrance] = useState(false);

  const ticket = {
    reserver: '홍길동',
    number: 'A123456789',
    title: 'GMF 2025',
    date: '2025.10.18',
    time: '17:00',
    place: '올림픽공원 88잔디마당',
    count: 2,        // 보유/예매 매수
    totalCount: 10,  // 총 정원(또는 기준값) — 임시 값
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.left}>
          <img src="/dummy-poster.jpg" alt="포스터" className={styles.poster} />
        </div>

        <div className={styles.right}>
          <div className={styles.row}>
            <span className={styles.label}>예매자</span>
            <span className={styles.value}>{ticket.reserver}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>예약번호</span>
            <span className={styles.value}>{ticket.number}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>일시</span>
            <span className={styles.value}>
              {ticket.date} ({'토'}) {ticket.time}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>장소</span>
            <span className={styles.value}>
              {ticket.place}
              <button className={styles.subBtn}>지도보기</button>
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>티켓수령 방법</span>
            <span className={styles.value}>
              {deliveryMethod}
              <button className={styles.subBtn} onClick={() => setShowQR(true)}>QR 보기</button>
            </span>
          </div>

          <div className={styles.row}>
            <span className={styles.label}>입장 인원 수</span>
            <span className={styles.value}>
              <button
                className={styles.subBtn}
                onClick={() => setShowEntrance(true)}
              >
                조회하기
              </button>
            </span>
          </div>
        </div>
      </div>

      <Modal isOpen={showQR} onClose={() => setShowQR(false)} title="티켓 QR 코드">
        <img src="/dummy-qr.png" alt="QR 코드" style={{ width: '180px', height: '180px' }} />
      </Modal>

      <EntranceCheckModal
        isOpen={showEntrance}
        onClose={() => setShowEntrance(false)}
        count={ticket.count}
        totalCount={ticket.totalCount}
        title={ticket.title}
        date={ticket.date}
        time={`${ticket.date} ${ticket.time}`}
      />
    </>
  );
};

export default TicketInfoCard;
