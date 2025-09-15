// src/components/my/dropdown/MenuItem.tsx
import React from 'react'
import styles from './MenuItem.module.css'

interface MenuItemProps {
  label: string
  onClick?: () => void
  icon?: React.ReactNode
}

const MenuItem: React.FC<MenuItemProps> = ({ label, onClick, icon }) => {
  return (
    <div className={styles.item} onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}>
      <span className={styles.left}>
        {icon ? <span className={styles.icon} aria-hidden>{icon}</span> : null}
        <span className={styles.label}>{label}</span>
      </span>
      {/* <span className={styles.arrow}>›</span> */}
    </div>
  )
}

export default MenuItem
