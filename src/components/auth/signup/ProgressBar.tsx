// features/auth/signup/components/ProgressBar.tsx
import React from 'react'
import styles from '@/pages/auth/SignupPage.module.css'

const ProgressBar: React.FC<{ percent: number }> = ({ percent }) => (
  <div className={styles.progressWrapper}>
    <div className={styles.progress} style={{ width: `${percent}%` }} />
  </div>
)

export default ProgressBar
