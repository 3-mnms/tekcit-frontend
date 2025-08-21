// 📄 src/components/payment/pay/PaymentInfo.tsx
// - 결제 우측 요약 카드 컴포넌트 확장 버전
// - 수령 방법, 매수, 1매 금액, 예매자 이름까지 표에 표시
// - 총 결제 금액은 (unitPrice * quantity + shippingFee)로 계산
// - festivalId는 화면 표시는 선택(요구 시 표시 토글 가능)

import React from 'react'
import styles from './PaymentInfo.module.css'

// ✅ 수령 방법 타입(좌측 ReceiveInfo와 동일 타입 사용 가정)
export type ReceiveType = 'QR' | 'DELIVERY'

// ✅ 컴포넌트에 전달할 요약 정보 타입
export interface PaymentSummaryProps {
  posterUrl?: string                      // 공연 포스터 URL
  title: string                           // 공연 제목
  dateTimeLabel: string                   // 일시(예: 2025.09.21 (일) 17:00)
  unitPrice: number                       // 1매 금액
  quantity: number                        // 매수
  shippingFee: number                     // 배송료(수령 방법이 배송일 때 사용)
  receiveType: ReceiveType                // 수령 방법
  buyerName?: string                      // 예매자 이름(옵션)
  festivalId?: string | number            // 페스티벌 ID(옵션: 표시는 기본 비노출)
  showFestivalId?: boolean                // true면 ID도 표시
}

// ✅ 통화 포맷 유틸(원화)
const asKRW = (n: number) =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 })
    .format(n)
    .replace('₩', '') + '원'

const receiveTypeLabel: Record<ReceiveType, string> = {
  QR: 'QR 티켓',
  DELIVERY: '지류 티켓 배송',
}

const PaymentInfo: React.FC<PaymentSummaryProps> = ({
  posterUrl,
  title,
  dateTimeLabel,
  unitPrice,
  quantity,
  shippingFee,
  receiveType,
  buyerName,
  festivalId,
  showFestivalId = false, // 기본은 ID 비표시
}) => {
  // ✅ 소계/총합 계산
  const subTotal = unitPrice * quantity
  const total = subTotal + shippingFee

  return (
    <div className={styles.card}>
      {/* 헤더(포스터 + 타이틀) */}
      <div className={styles.header}>
        <div className={styles.posterBox} aria-hidden={!posterUrl}>
          {posterUrl ? <img src={posterUrl} alt="공연 포스터" className={styles.poster} /> : <div className={styles.posterPlaceholder} />}
        </div>
        <div className={styles.titleBox}>
          <p className={styles.title}>{title}</p>
          <p className={styles.sub}>{dateTimeLabel}</p>
        </div>
      </div>

      {/* 정보 표 */}
      <div className={styles.table}>
        {showFestivalId && festivalId != null && (
          <div className={styles.row}>
            <span className={styles.label}>페스티벌 ID</span>
            <span className={styles.value}>{festivalId}</span>
          </div>
        )}

        {buyerName && (
          <div className={styles.row}>
            <span className={styles.label}>예매자</span>
            <span className={styles.value}>{buyerName}</span>
          </div>
        )}

        <div className={styles.row}>
          <span className={styles.label}>수령 방법</span>
          <span className={styles.value}>{receiveTypeLabel[receiveType]}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>매수</span>
          <span className={styles.value}>{quantity}매</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>티켓 금액</span>
          <span className={styles.value}>{asKRW(unitPrice)}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>배송료</span>
          <span className={styles.value}>{asKRW(shippingFee)}</span>
        </div>

        <div className={`${styles.row} ${styles.totalRow}`}>
          <span className={styles.labelTotal}>총 결제</span>
          <span className={styles.valueTotal}>{asKRW(total)}</span>
        </div>
      </div>


      {/* 약관 간략 문구 */}
      <p className={styles.notice}>
        결제 진행 시 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.
        <button type="button" className={styles.linkBtn} aria-label="약관 상세보기">[상세보기]</button>
      </p>
    </div>
  )
}

export default PaymentInfo
