import { useEffect, useMemo, useState } from 'react'
import { MAX_UI_SEC, remainingSecondsFromLS } from './session-utils'
import { reissue } from '@/shared/api/auth/login'
import { tokenStore } from '@/shared/storage/tokenStore'

interface Options {
  onExpire?: () => void
  maxUiSec?: number
}

export function useSessionTimer(opts?: Options) {
  const maxUiSec = opts?.maxUiSec ?? MAX_UI_SEC
  const initialLeft = useMemo(() => remainingSecondsFromLS(maxUiSec), [maxUiSec])
  const [timeLeft, setTimeLeft] = useState(initialLeft)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          opts?.onExpire?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [opts, maxUiSec])

  useEffect(() => {
    const onTokenChange = () => setTimeLeft(remainingSecondsFromLS(maxUiSec))
    window.addEventListener('auth:token', onTokenChange)
    onTokenChange() // 마운트 시 1회 동기화
    return () => window.removeEventListener('auth:token', onTokenChange)
  }, [maxUiSec])

  async function extendSession() {
    const data = await reissue()
    tokenStore.set(data.accessToken)
    setTimeLeft(remainingSecondsFromLS(maxUiSec))
  }

  function resetFromToken() {
    setTimeLeft(remainingSecondsFromLS(maxUiSec))
  }

  return { timeLeft, extendSession, resetFromToken }
}
