import { FaQrcode, FaTruck } from 'react-icons/fa'

import styles from './ReceiveInfo.module.css'

export type ReceiveType = 'QR' | 'DELIVERY'

const DISPLAY_MAP: Record<ReceiveType, { title: string; desc: string }> = {
  QR: { title: 'QR 티켓', desc: '앱/웹에서 QR로 바로 입장' },
  DELIVERY: { title: '지류 티켓 배송', desc: '주소지로 실물 티켓 배송' },
}

interface Props {
  value: ReceiveType
  labelOverride?: { title?: string; desc?: string }
}

const ReceiveInfo: React.FC<Props> = ({ value, labelOverride }) => {
  const base = DISPLAY_MAP[value]
  const title = labelOverride?.title ?? base.title
  const desc = labelOverride?.desc ?? base.desc

  return (
    <section aria-label="수령 방법">
      <h2 className={styles.title}>수령 방법</h2>

      <div className={`${styles.displayBox} ${styles.readonly}`} role="status" aria-live="polite">
        <span className={styles.icon}>
          {value === 'QR' ? <FaQrcode /> : <FaTruck />}
        </span>

        <div className={styles.textGroup}>
          <span className={styles.label}>{title}</span>
          <span className={styles.desc}>{desc}</span>
        </div>
      </div>
    </section>
  )
}

export default ReceiveInfo
