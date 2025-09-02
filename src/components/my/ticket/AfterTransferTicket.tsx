// src/components/my/ticket/transfer/AfterTransferTicket.tsx
import React from 'react';
import styles from './AfterTransferTicket.module.css';

const priceFormatter = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
});

type Relation = '가족' | '지인';
type RawStatus = string; // 백엔드에서 뭐가 오든 문자열로 받고
type NormalizedStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

function normalizeStatus(s?: RawStatus): NormalizedStatus {
    const v = (s ?? '').toString().trim().toUpperCase();
    // 흔한 변형들 매핑
    if (['PENDING', 'WAITING', 'REQUESTED'].includes(v)) return 'PENDING';
    if (['APPROVED', 'ACCEPTED', 'SUCCESS', 'OK'].includes(v)) return 'APPROVED';
    if (['REJECTED', 'DENIED', 'DECLINED', 'CANCELED', 'CANCELLED'].includes(v)) return 'REJECTED';
    // 모르면 대기중으로
    return 'PENDING';
}

type Props = {
    title: string;
    date: string;   // YYYY-MM-DD
    time: string;   // HH:mm
    relation: Relation;
    status: RawStatus;           // ← 유연하게 받기
    posterUrl?: string;
    price?: number;              // 지인일 경우 가격
    count: number;               // 매수
    onAccept?: () => void;
    onReject?: () => void;
};

const AfterTransferTicket: React.FC<Props> = ({
    title,
    date,
    time,
    relation,
    status,
    posterUrl,
    price,
    count,
    onAccept,
    onReject,
}) => {
    const fallbackPoster = '/dummy-poster.jpg';
    const showPrice = relation === '지인' && typeof price === 'number';

    const s = normalizeStatus(status); // ← 여기서 표준화

    const StatusBadge = () => {
        if (s === 'PENDING') return <span className={`${styles.badge} ${styles.pending}`}>수락 대기중</span>;
        if (s === 'APPROVED') return <span className={`${styles.badge} ${styles.approved}`}>승인됨</span>;
        if (s === 'REJECTED') return <span className={`${styles.badge} ${styles.rejected}`}>거절됨</span>;
        return null;
    };

    return (
        <div className={styles.card}>
            <img
                src={posterUrl || fallbackPoster}
                alt={`${title} 포스터`}
                className={styles.poster}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackPoster; }}
            />

            <div className={styles.details}>
                {/* 제목과 뱃지를 한 줄에 */}
                <div className={styles.topRow}>
                    <span className={styles.label}>공연명:</span>
                    <span className={styles.value}>{title}</span>
                    <StatusBadge />
                </div>

                <p><strong>일시:</strong> {date} {time}</p>
                <p><strong>매수:</strong> {count}매</p>

                {showPrice ? (
                    <p className={styles.priceRow}>
                        <strong>가격:</strong> {priceFormatter.format(price!)}
                    </p>
                ) : (
                    <p className={styles.priceRowHidden} aria-hidden="true"></p>
                )}

                <p><strong>관계:</strong> {relation}</p>

                {/* 대기중일 때만 버튼 노출 */}
                {s === 'PENDING' && (
                    <div className={styles.buttonWrapper}>
                        <button className={`${styles.btn} ${styles.accept}`} onClick={onAccept}>수락</button>
                        <button className={`${styles.btn} ${styles.reject}`} onClick={onReject}>거절</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AfterTransferTicket;
