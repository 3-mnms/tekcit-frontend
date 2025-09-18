// src/components/my/dropdown/UserDropdown.tsx
import React, { useMemo, useState } from 'react'
import styles from './UserDropdown.module.css'
import PointBox from '@components/my/dropdown/PointBox'
import MenuItem from '@components/my/dropdown/MenuItem'
import { HiOutlineSpeakerphone, HiOutlineChevronRight, HiOutlineUser, HiOutlineTicket, HiOutlineBookmark, HiOutlineLogout } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'

import { logout as logoutApi } from '@/shared/api/auth/login'
import { useAuthStore } from '@/shared/storage/useAuthStore'

import NotificationDropdown from '@/pages/my/dropdown/NotificationDropdown'
import NotificationDetailDropdown from '@/pages/my/dropdown/NotificationDetailDropdown'
import { useNotificationStore } from '@/models/dropdown/NotificationStore'
import { useHydrateNotifications } from '@/models/dropdown/useNotificationQuery'
import Spinner from '@/components/common/spinner/Spinner'

const UserDropdown: React.FC = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const userName = useAuthStore((s) => s.user?.name) || '사용자명'
  const userInitial = userName.trim().length > 0 ? userName.trim().charAt(0) : 'U'

  const [loading, setLoading] = useState(false)
  const [panel, setPanel] = useState<'root' | 'notifications' | 'notificationDetail'>('root')
  const [selectedNid, setSelectedNid] = useState<number | null>(null)
  useHydrateNotifications(panel !== 'root')

  const notifications = useNotificationStore((s) => s.notifications)
  const hasUnread = useMemo(() => notifications.some((n) => !n.read), [notifications])

  const openList = () => setPanel('notifications')
  const openDetail = (nid: number) => {
    if (!Number.isFinite(nid)) return
    setSelectedNid(nid)
    setPanel('notificationDetail')
  }
  const backFromDetail = () => setPanel('notifications')

  const handleGoToMypage = () => {
    window.location.href = '/mypage'
  }
  const handleLogout = async () => {
    if (loading) return
    const confirmed = window.confirm('로그아웃 하시겠습니까?')
    if (!confirmed) return

    setLoading(true)
    try {
      await logoutApi()
    } catch (e) {
      console.error(e)
    } finally {
      logout()
      setLoading(false)
      alert('로그아웃 되었습니다.')
      if (window.location.pathname === "/") {
      window.location.reload()
    } else {
      navigate("/", { replace: true })
    }
    }
  }

  return (
    <div className={styles.dropdown}>
      {panel === 'root' && (
        <>
          <div className={styles.header}>
            <button className={styles.usernameButton} onClick={handleGoToMypage}>
              <span className={styles.avatar} aria-hidden>
                <span className={styles.avatarTxt}>{userInitial}</span>
              </span>
              <span className={styles.username}>{userName}</span>
              <HiOutlineChevronRight className={styles.usernameIcon} />
            </button>

            <button className={styles.alarmButton} onClick={openList} aria-label="알림 열기">
              <span className={styles.alarmWrap}>
                <HiOutlineSpeakerphone className={styles.alarmIcon} />
                {hasUnread && <span className={styles.alarmDot} aria-hidden="true" />}
              </span>
            </button>
          </div>

          <div className={styles.content}>
            <PointBox />

            {/* ✅ 메뉴 아이콘 추가 */}
            <MenuItem
              label="내 정보 수정"
              icon={<HiOutlineUser />}
              onClick={() => (window.location.href = '/mypage/myinfo/detail')}
            />
            <MenuItem
              label="내 티켓"
              icon={<HiOutlineTicket />}
              onClick={() => (window.location.href = '/mypage/ticket/history')}
            />
            <MenuItem
              label="북마크"
              icon={<HiOutlineBookmark />}
              onClick={() => (window.location.href = '/mypage/bookmark')}
            />
          </div>

          {loading && <Spinner />}

          {/* 로그아웃 버튼에도 아이콘 살짝 */}
          <button className={styles.logoutButton} onClick={handleLogout} disabled={loading}>
            <HiOutlineLogout className={styles.logoutIcon} aria-hidden />
            로그아웃
          </button>
        </>
      )}

      {panel === 'notifications' && (
        <NotificationDropdown
          contentOnly
          onBack={() => setPanel('root')}
          onOpenDetail={openDetail}
        />
      )}

      {panel === 'notificationDetail' && selectedNid !== null && (
        <NotificationDetailDropdown nid={selectedNid} contentOnly onBack={backFromDetail} />
      )}
    </div>
  )
}

export default UserDropdown
