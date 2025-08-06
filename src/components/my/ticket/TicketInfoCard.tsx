import React, { useState } from 'react';
import styles from './TicketInfoCard.module.css';
import Modal from './QRModal';

const TicketInfoCard: React.FC = () => {
  const deliveryMethod = '모바일 티켓';
  const [showQR, setShowQR] = useState(false);

  return (
    <>
      <div className={styles.card}>
        <div className={styles.left}>
          <img src="/dummy-poster.jpg" alt="포스터" className={styles.poster} />
        </div>

        <div className={styles.right}>
          <div className={styles.row}>
            <span className={styles.label}>예매자</span>
            <span className={styles.value}>홍길동</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>예약번호</span>
            <span className={styles.value}>A123456789</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>일시</span>
            <span className={styles.value}>2025년 10월 18일 (토) 17:00</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>장소</span>
            <span className={styles.value}>
              올림픽공원 88잔디마당
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
        </div>
      </div>

      <Modal isOpen={showQR} onClose={() => setShowQR(false)} title="티켓 QR 코드">
        <img src="/dummy-qr.png" alt="QR 코드" style={{ width: '180px', height: '180px' }} />
      </Modal>
    </>
  );
};

export default TicketInfoCard;