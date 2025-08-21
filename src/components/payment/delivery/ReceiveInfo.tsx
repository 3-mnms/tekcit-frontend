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
    <div className={styles.wrapper}>
      <div className={styles.box}>
        <div className={styles.icon}>
          {value === 'QR' ? <FaQrcode /> : <FaTruck />}
        </div>
        <div className={styles.texts}>
          <p className={styles.title}>{title}</p>
          <p className={styles.desc}>{desc}</p>
        </div>
      </div>
    </div>
  )
}

export default ReceiveInfo
