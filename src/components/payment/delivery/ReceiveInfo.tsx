// 예매 결제 페이지에서 수령 방법 section
import { FaQrcode, FaTruck } from 'react-icons/fa'
import styles from './ReceiveInfo.module.css'

export type ReceiveType = 'QR' | 'DELIVERY'

// 표시 텍스트 매핑
const DISPLAY_MAP: Record<ReceiveType, { title: string; desc: string }> = {
  QR: { title: 'QR 티켓', desc: '앱/웹에서 QR로 바로 입장' },
  DELIVERY: { title: 'QR 티켓 제공과 지류 티켓 배송', desc: '주소지로 실물 티켓 배송' },
}

interface Props {
  rawValue?: string
  labelOverride?: { title?: string; desc?: string }
}

const ReceiveInfo: React.FC<Props> = ({ rawValue, labelOverride }) => {
  // 기본값: QR
  const value: ReceiveType = rawValue === 'DELIVERY' ? 'DELIVERY' : 'QR'

  const base = DISPLAY_MAP[value]
  const title = labelOverride?.title ?? base.title
  const desc = labelOverride?.desc ?? base.desc

  return (
    <div className={styles.wrapper}>
      <div className={styles.box}>
        <div className={styles.icon}>{value === 'QR' ? <FaQrcode /> : <FaTruck />}</div>
        <div className={styles.texts}>
          <p className={styles.title}>{title}</p>
          <p className={styles.desc}>{desc}</p>
        </div>
      </div>
    </div>
  )
}

export default ReceiveInfo
