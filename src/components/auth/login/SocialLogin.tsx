import React, { useEffect, useRef } from 'react'
import styles from './SocialLogin.module.css'
import KaKao from '@assets/kakao.png'
import { reissue, type ReissueResponseDTO } from '@/shared/api/auth/login'
import { tokenStore } from '@/shared/storage/tokenStore'

const POPUP_NAME = 'kakaoPopup'

const SocialLogin: React.FC = () => {
  const popupRef = useRef<Window | null>(null)
  const pollTimer = useRef<number | null>(null)
  const storagePollTimer = useRef<number | null>(null)
  const processedRef = useRef(false)

  const finishAndGo = async (status: 'existing' | 'new') => {
    if (processedRef.current) return
    processedRef.current = true

    try {
      const data = await reissue()
      const access = (data as ReissueResponseDTO)?.accessToken
      if (access) {
        tokenStore.set(access)
        console.log('[Kakao] accessToken (raw):', access)
      }
    } catch (e) {
      console.error('[kakao] reissue failed', e)
    }

    if (pollTimer.current) window.clearInterval(pollTimer.current)
    if (storagePollTimer.current) window.clearInterval(storagePollTimer.current)
    try { popupRef.current?.close() } catch {}
    try { localStorage.removeItem('kakao_auth_done') } catch {}

    if (status === 'existing') {
      window.location.replace('/')
    } else {
      window.location.replace('/auth/signup/kakao?provider=kakao')
    }
  }

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'kakao_auth_done' || !e.newValue) return
      try {
        const payload = JSON.parse(e.newValue) as { status: 'existing' | 'new'; ts: number }
        void finishAndGo(payload.status)
      } catch {}
    }
    window.addEventListener('storage', onStorage)

    storagePollTimer.current = window.setInterval(() => {
      const v = localStorage.getItem('kakao_auth_done')
      if (!v) return
      try {
        const payload = JSON.parse(v) as { status: 'existing' | 'new'; ts: number }
        void finishAndGo(payload.status)
      } catch {}
    }, 400)

    const onFocus = () => {
      const v = localStorage.getItem('kakao_auth_done')
      if (!v) return
      try {
        const payload = JSON.parse(v) as { status: 'existing' | 'new'; ts: number }
        void finishAndGo(payload.status)
      } catch {}
    }
    window.addEventListener('visibilitychange', onFocus)
    window.addEventListener('focus', onFocus)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('visibilitychange', onFocus)
      window.removeEventListener('focus', onFocus)
      if (storagePollTimer.current) window.clearInterval(storagePollTimer.current)
    }
  }, [])

  const handleKakaoLogin = () => {
    const w = 520
    const h = 680
    const left = window.screenX + (window.outerWidth - w) / 2
    const top = window.screenY + (window.outerHeight - h) / 2

    processedRef.current = false

    popupRef.current = window.open(
      '/api/auth/kakao/authorize',
      POPUP_NAME,
      `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`,
    )

    if (!popupRef.current) {
      window.location.href = '/api/auth/kakao/authorize'
      return
    }

    pollTimer.current = window.setInterval(() => {
      if (!popupRef.current || popupRef.current.closed) {
        window.clearInterval(pollTimer.current!)
        pollTimer.current = null
      }
    }, 500)
  }

  return (
    <div className={styles.container}>
      <button className={styles.snsButton} onClick={handleKakaoLogin}>
        <img src={KaKao} alt="kakao" className={styles.icon} />
        카카오로 시작하기
      </button>
    </div>
  )
}

export default SocialLogin
