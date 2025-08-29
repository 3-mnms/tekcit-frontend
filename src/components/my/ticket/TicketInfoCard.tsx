// src/components/my/ticket/TicketInfoCard.tsx
import React, { useMemo, useState } from 'react'
import styles from './TicketInfoCard.module.css'
import Modal from './QRModal'
import EntranceCheckModalLoader from '@/components/my/ticket/EntranceCheckModalLoader' 
import { format } from 'date-fns'
import QRViewer from './QRViewer'

type Props = {
  festivalId: string;            
  reservationNumber: string
  title: string
  place: string
  performanceDateISO: string
  deliveryMethod: 'MOBILE' | 'PAPER'
  qrIds: string[]
  address?: string
  posterFile?: string
  reserverName?: string
  selectedTicketCount?: number       
  totalCountForGauge?: number        
}

const deliveryLabel = (t: 'MOBILE' | 'PAPER') => (t === 'MOBILE' ? '모바일 티켓' : '지류 티켓')

const TicketInfoCard: React.FC<Props> = ({
  festivalId,
  reservationNumber,
  title,
  place,
  performanceDateISO,
  deliveryMethod,
  qrIds,
  address,
  posterFile,
  reserverName,
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

  const posterSrc = useMemo(() => {
    const src = (posterFile ?? '').trim()
    return src.length > 0 ? src : '/dummy-poster.jpg'
  }, [posterFile])

  return (
    <>
      <div className={styles.card}>
        <div className={styles.left}>
          <img
            src={posterSrc}
            alt={`포스터 - ${title}`}
            className={styles.poster}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/dummy-poster.jpg' }}
          />
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
              {ymd} {hm && <>({/* 요일 필요시 */}) {hm}</>}
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

      {/* ⬇️ 여기서 실데이터 조회 후 기존 모달에 주입 */}
      <EntranceCheckModalLoader
        isOpen={showEntrance}
        onClose={() => setShowEntrance(false)}
        festivalId={festivalId}
        performanceDateISO={performanceDateISO}
        title={title}
      />
    </>
  )
}

export default TicketInfoCard
