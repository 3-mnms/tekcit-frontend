import React, { useMemo, useState } from 'react'
import styles from './TicketInfoCard.module.css'
import Modal from './QRModal'
import EntranceCheckModalLoader from '@/components/my/ticket/EntranceCheckModalLoader'
import { format } from 'date-fns'
import QRViewer from './QRViewer'
import KakaoMapModal from '@/components/shared/kakao/KakaoMapModal'
import { Calendar, Receipt, MapPin, Users, Ticket as TicketIcon } from 'lucide-react'

type Props = {
  festivalId: string
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
  const [showMap, setShowMap] = useState(false)

  const ymd = useMemo(() => {
    const d = new Date(performanceDateISO)
    return isNaN(d.getTime()) ? performanceDateISO : format(d, 'yyyy.MM.dd (EEE)')
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
        {/* 포스터 */}
        <div className={styles.left}>
          <div className={styles.posterWrap}>
            <img
              src={posterSrc}
              alt={`포스터 - ${title}`}
              className={styles.poster}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).src = '/dummy-poster.jpg'
              }}
            />
          </div>
        </div>

        {/* 정보 */}
        <div className={styles.right}>
          {/* 1열 */}
          <div className={styles.row}>
            <Users className={styles.rowIcon} />
            <div className={styles.kv}>
              <p className={styles.k}>예매자</p>
              <p className={styles.v}>{reserverName ?? '-'}</p>
            </div>
          </div>

          <div className={styles.row}>
            <Receipt className={styles.rowIcon} />
            <div className={styles.kv}>
              <p className={styles.k}>예약번호</p>
              <p className={`${styles.v} ${styles.mono}`}>{reservationNumber}</p>
            </div>
          </div>

          {/* 2열 */}
          <div className={styles.row}>
            <Calendar className={styles.rowIcon} />
            <div className={styles.kv}>
              <p className={styles.k}>일시</p>
              <p className={styles.v}>
                {ymd} {hm && hm}
              </p>
            </div>
          </div>

          <div className={styles.row}>
            <MapPin className={styles.rowIcon} />
            <div className={styles.kv}>
              <p className={styles.k}>장소</p>
              <p className={styles.v}>
                {place}
                <button type="button" className={styles.subBtnOutline} onClick={() => setShowMap(true)}>
                  지도보기
                </button>
              </p>
            </div>
          </div>

          {/* 3열 */}
          <div className={styles.row}>
            <TicketIcon className={styles.rowIcon} />
            <div className={styles.kv}>
              <p className={styles.k}>티켓수령 방법</p>
              <p className={styles.v}>
                {deliveryLabel(deliveryMethod)}
                <button type="button" className={styles.subBtn} onClick={() => setShowQR(true)}>
                  QR 보기
                </button>
              </p>
            </div>
          </div>

          <div className={styles.row}>
            <Users className={styles.rowIcon} />
            <div className={styles.kv}>
              <p className={styles.k}>입장 인원 수</p>
              <p className={styles.v}>
                <button type="button" className={styles.subBtn2} onClick={() => setShowEntrance(true)}>
                  조회하기
                </button>
              </p>
            </div>
          </div>

          {deliveryMethod === 'PAPER' && (
            <div className={`${styles.row} ${styles.span2}`}>
              <Receipt className={styles.rowIcon} />
              <div className={styles.kv}>
                <p className={styles.k}>배송지</p>
                <p className={styles.v}>{address ?? '-'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR 모달 */}
      <Modal isOpen={showQR} onClose={() => setShowQR(false)} title="티켓 QR">
        <QRViewer ids={qrIds} size={180} />
      </Modal>

      {/* 입장 인원 모달 */}
      <EntranceCheckModalLoader
        isOpen={showEntrance}
        onClose={() => setShowEntrance(false)}
        festivalId={festivalId}
        performanceDateISO={performanceDateISO}
        title={title}
      />

      {/* 지도 모달 */}
      <KakaoMapModal isOpen={showMap} onClose={() => setShowMap(false)} query={place} />
    </>
  )
}

export default TicketInfoCard
