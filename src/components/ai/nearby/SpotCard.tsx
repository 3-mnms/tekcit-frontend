// src/components/ai/nearby/SpotCard.tsx
import React from 'react'
import styles from './NearbySpotEmbed.module.css'

export type PlayEatSpot = {
    id: string
    kind: 'play' | 'eat'
    name: string
    address: string
    lat: number
    lng: number
    url?: string
    distanceKm?: number
}

export default function SpotCard({
    spot,
    active,
    onClick,
}: {
    spot: PlayEatSpot
    active: boolean
    onClick: () => void
}) {
    return (
        <button
            className={`${styles.card} ${active ? styles.cardActive : ''} ${spot.kind === 'play' ? styles.cardAccent : styles.cardAccent2
                }`}
            onClick={onClick}
            type="button"
            aria-pressed={active}
        >
            <div className={styles.cardMain}>
                <div className={styles.cardTitleRow}>
                    <strong className={styles.cardTitle}>{spot.name}</strong>
                </div>
                <div className={styles.addr}>{spot.address}</div>
            </div>
        </button>

    )
}
