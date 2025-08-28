// src/components/my/ticket/TicketInfoCard.tsx
import React, { useMemo, useState } from 'react'
import styles from './TicketInfoCard.module.css'
import Modal from './QRModal'
import EntranceCheckModal from '@/components/my/ticket/EntranceCheckModal'
import { format } from 'date-fns'
import QRCode from 'react-qr-code'
import QRViewer from './QRViewer'

type Props = {
  reservationNumber: string
  title: string
  place: string
  performanceDateISO: string // ex) 2025-10-18T17:00:00
  deliveryMethod: 'MOBILE' | 'PAPER'
  qrIds: string[]
  address?: string
  reserverName?: string // DTO엔 없으니 옵션
  // 아래 두 값은 현재 DTO에 없어서 임시로 selectedTicketCount를 쓰는 편.
  // 필요하면 detail DTO에 매수, 결제정보 등을 추가해줘.
  selectedTicketCount?: number
  totalCountForGauge?: number // 원형/막대그래프용 기준값
}

const deliveryLabel = (t: 'MOBILE' | 'PAPER') => (t === 'MOBILE' ? '모바일 티켓' : '지류 티켓')

const TicketInfoCard: React.FC<Props> = ({
  reservationNumber,
  title,
  place,
  performanceDateISO,
  deliveryMethod,
  qrIds,
  address,
  reserverName,
  selectedTicketCount = 1,
  totalCountForGauge,
}) => {
  const [showQR, setShowQR] = useState(false)
  const [showEntrance, setShowEntrance] = useState(false)

  const ymd = useMemo(() => {
    const d = new Date(performanceDateISO)
    return isNaN(d.getTime()) ? performanceDateISO : format(d, 'yyyy.MM.dd')
  }, [performanceDateISO])

  const hm = useMemo(() => {
    const d = new Date(performanceDateISO)
    return isNaN(d.getTime()) ? '' : format(d, 'HH:mm')
  }, [performanceDateISO])

  const gaugeTotal = totalCountForGauge ?? selectedTicketCount

  return (
    <>
      <div className={styles.card}>
        <div className={styles.left}>
          <img src="/dummy-poster.jpg" alt="포스터" className={styles.poster} />
        </div>

        <div className={styles.right}>
          <div className={styles.row}>
            <span className={styles.label}>예매자</span>
            <span className={styles.value}>{reserverName ?? '-'}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>예약번호</span>
            <span className={styles.value}>{reservationNumber}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>일시</span>
            <span className={styles.value}>
              {ymd}{' '}
              {hm && (
                <>
                  ({/* 요일 필요시 로직 추가 */}) {hm}
                </>
              )}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>장소</span>
            <span className={styles.value}>
              {place}
              <button className={styles.subBtn}>지도보기</button>
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>티켓수령 방법</span>
            <span className={styles.value}>
              {deliveryLabel(deliveryMethod)}
              {deliveryMethod === 'MOBILE' && (
                <button className={styles.subBtn} onClick={() => setShowQR(true)}>
                  QR 보기
                </button>
              )}
            </span>
          </div>

          {deliveryMethod === 'PAPER' && (
            <div className={styles.row}>
              <span className={styles.label}>배송지</span>
              <span className={styles.value}>{address ?? '-'}</span>
            </div>
          )}

          <div className={styles.row}>
            <span className={styles.label}>입장 인원 수</span>
            <span className={styles.value}>
              <button className={styles.subBtn} onClick={() => setShowEntrance(true)}>
                조회하기
              </button>
            </span>
          </div>
        </div>
      </div>

      <Modal isOpen={showQR} onClose={() => setShowQR(false)} title="티켓 QR">
        <QRViewer ids={qrIds} size={180} />
      </Modal>

      <EntranceCheckModal
        isOpen={showEntrance}
        onClose={() => setShowEntrance(false)}
        count={selectedTicketCount}
        totalCount={gaugeTotal}
        title={title}
        date={ymd}
        time={`${ymd} ${hm}`}
      />
    </>
  )
}

export default TicketInfoCard
