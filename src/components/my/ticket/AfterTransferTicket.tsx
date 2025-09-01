// src/components/my/ticket/transfer/AfterTransferTicket.tsx
import React from 'react';
import styles from './AfterTransferTicket.module.css';

const priceFormatter = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
});

type Props = {
    title: string;
    date: string;   // YYYY-MM-DD
    time: string;   // HH:mm
    relation: '가족' | '지인';
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    posterUrl?: string;
    price?: number; // 지인일 경우 가격
    count: number;  // 매수
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

    const StatusBadge = () => {
        if (status === 'PENDING') return <span className={`${styles.badge} ${styles.pending}`}>수락 대기중</span>;
        if (status === 'APPROVED') return <span className={`${styles.badge} ${styles.approved}`}>승인됨</span>;
        if (status === 'REJECTED') return <span className={`${styles.badge} ${styles.rejected}`}>거절됨</span>;
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
                <div className={styles.topRow}>
                    <p className={styles.title}><strong>공연명.</strong> {title}</p>
                    <StatusBadge />
                </div>

                <div className={styles.info}>
                    <p><strong>일시.</strong> {date} {time}</p>
                    <p><strong>관계.</strong> {relation}</p>
                    <p><strong>매수.</strong> {count}매</p>
                    {showPrice ? (
                        <p className={styles.priceRow}>
                            <strong>가격.</strong> {priceFormatter.format(price!)}
                        </p>
                    ) : (
                        <p className={styles.priceRowHidden} aria-hidden="true"></p>
                    )}
                </div>

                {status === 'PENDING' && (
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
