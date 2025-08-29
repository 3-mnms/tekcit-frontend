import React, { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import styles from './QRViewer.module.css'

type Props = {
  ids: string[]
  size?: number // QR 한 변 길이(px), 기본 180
}

const QRViewer: React.FC<Props> = ({ ids, size = 180 }) => {
  const [idx, setIdx] = useState(0)
  const total = ids?.length ?? 0

  // ids 바뀌면 0번으로 리셋
  useEffect(() => { setIdx(0) }, [ids?.join('|')])

  if (!ids || total === 0) return <div className={styles.empty}>QR 코드가 없습니다.</div>

  const prev = () => setIdx((i) => Math.max(0, i - 1))
  const next = () => setIdx((i) => Math.min(total - 1, i + 1))

  return (
    <div className={styles.root} style={{ ['--qr-size' as any]: `${size}px` }}>
      {/* 고정 뷰포트: QR 1장 크기만큼 고정 */}
      <div className={styles.viewport} aria-label={`QR ${idx + 1}`}>
        <QRCode value={ids[idx]} size={size} />
      </div>

      {/* 라벨: QR 1 / N */}
      <div className={styles.captionRow}>
        <span className={styles.caption}>QR {idx + 1}{total > 1 ? ` / ${total}` : ''}</span>
      </div>

      {/* 여러 장일 때만 네비게이션 표시 */}
      {total > 1 && (
        <div className={styles.controls}>
          <button className={styles.navBtn} onClick={prev} disabled={idx === 0} aria-label="이전 QR">‹</button>
          <div className={styles.dots}>
            {ids.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === idx ? styles.activeDot : ''}`}
                onClick={() => setIdx(i)}
                aria-label={`QR ${i + 1}`}
              />
            ))}
          </div>
          <button className={styles.navBtn} onClick={next} disabled={idx === total - 1} aria-label="다음 QR">›</button>
        </div>
      )}
    </div>
  )
}

export default QRViewer
