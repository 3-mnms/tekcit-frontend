// src/components/my/dropdown/UserDropdown.tsx
import React, { useMemo, useState } from 'react'
import styles from './UserDropdown.module.css'
import PointBox from '@components/my/dropdown/PointBox'
import MenuItem from '@components/my/dropdown/MenuItem'
import { HiOutlineSpeakerphone, HiOutlineChevronRight } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'

import { logout as logoutApi } from '@/shared/api/auth/login'
import { useAuthStore } from '@/shared/storage/useAuthStore'

import NotificationDropdown from '@/pages/my/dropdown/NotificationDropdown'
import NotificationDetailDropdown from '@/pages/my/dropdown/NotificationDetailDropdown'
import { useNotificationStore } from '@/models/dropdown/NotificationStore'
import { useHydrateNotifications } from '@/models/dropdown/useNotificationQuery'

type Panel = 'root' | 'notifications' | 'notificationDetail'

const UserDropdown: React.FC = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const userName = useAuthStore((s) => s.user?.name) || '사용자명'
  const [loading, setLoading] = useState(false)
  const [panel, setPanel] = useState<'root' | 'notifications' | 'notificationDetail'>('root')
  const [selectedNid, setSelectedNid] = useState<number | null>(null)
  useHydrateNotifications(panel !== 'root') // 알림 화면 들어가면 목록 불러오기

  const notifications = useNotificationStore((s) => s.notifications)
  const hasUnread = useMemo(() => notifications.some((n) => !n.read), [notifications])

  const openList = () => setPanel('notifications')
  const openDetail = (nid: number) => {
  if (!Number.isFinite(nid)) return;   // ✅ 방어
  setSelectedNid(nid);
  setPanel('notificationDetail');
};
  const backFromDetail = () => setPanel('notifications')

  const handleGoToMypage = () => navigate('/mypage')
  const handleLogout = async () => {
    if (loading) return
    setLoading(true)
    try {
      await logoutApi()
    } catch (e) {
      console.error(e)
    } finally {
      logout()
      setLoading(false)
      alert('로그아웃!')
      navigate('/login')
    }
  }

  return (
    <div className={styles.dropdown}>
      {panel === 'root' && (
        <>
          <div className={styles.header}>
            <button className={styles.usernameButton} onClick={handleGoToMypage}>
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

          <PointBox />
          <MenuItem label="내 정보 수정" onClick={() => navigate('/mypage/myinfo')} />
          <MenuItem label="내 티켓" onClick={() => navigate('/mypage/ticket')} />
          <MenuItem label="북마크" onClick={() => navigate('/mypage/bookmark')} />
          <button className={styles.logoutButton} onClick={handleLogout} disabled={loading}>
            {loading ? '로그아웃 중...' : '로그아웃'}
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
