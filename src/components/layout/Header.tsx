import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Header.module.css'
import logo from '@shared/assets/manager_logo.png'
import { IoLogOutOutline } from 'react-icons/io5'

import { useAuthStore } from '@/shared/storage/useAuthStore'
import { useSessionTimer } from '@/models/auth/admin/useSessionTimer'
import { formatSeconds } from '@/models/auth/admin/session-utils'
import { logout as logoutApi } from '@/shared/api/auth/login'

interface HeaderProps {
  userName: string
  onLogout: () => void
}

const AdminHeader: React.FC<HeaderProps> = ({ userName, onLogout, ...props }) => {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch (e) {
      console.error(e)
    } finally {
      logout()
      onLogout?.()
      navigate('/login', { replace: true })
    }
  }

  const handleLogoClick = () => {
    navigate('/') // ✅ 메인 화면 경로
  }

  const { timeLeft, extendSession } = useSessionTimer({ onExpire: handleLogout })

  const sessionTimeStyle =
    timeLeft <= 300 ? `${styles.sessionTime} ${styles.sessionTimeWarning}` : styles.sessionTime

  return (
    <header className={styles.header} {...props}>
      <div className={styles.left}>
        <img
          src={logo}
          alt="tekcit logo"
          className={styles.logo}
          onClick={handleLogoClick}
          style={{ cursor: 'pointer' }}
        />
      </div>

      <div className={styles.right}>
        <span className={styles.userInfo}>
          <strong>{userName}</strong>님
        </span>
        <span className={styles.separator}>|</span>

        <button type="button" onClick={handleLogout} className={styles.logoutLink} title="로그아웃">
          로그아웃 <IoLogOutOutline size={15} style={{ marginLeft: 2, verticalAlign: 'middle' }} />
        </button>

        <span className={styles.separator}>|</span>
        <span className={sessionTimeStyle}>{formatSeconds(timeLeft)}</span>
        <span className={styles.separator}>|</span>

        <button type="button" onClick={extendSession} className={styles.extendButton}>
          시간 연장
        </button>
      </div>
    </header>
  )
}

export default AdminHeader
