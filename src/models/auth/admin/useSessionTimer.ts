// src/models/auth/admin/useSessionTimer.ts
import { useEffect, useMemo, useState } from 'react'
import { MAX_UI_SEC, remainingSecondsFromStore } from './session-utils'
import { reissue, type ReissueResponseDTO } from '@/shared/api/auth/login'
import { useAuthStore } from '@/shared/storage/useAuthStore'

interface Options {
  onExpire?: () => void
  maxUiSec?: number
}

export function useSessionTimer(opts?: Options) {
  const maxUiSec = opts?.maxUiSec ?? MAX_UI_SEC

  // 남은 시간 계산 함수
  const calcLeft = () => remainingSecondsFromStore(maxUiSec)

  // 초기값
  const initialLeft = useMemo(calcLeft, [maxUiSec])
  const [timeLeft, setTimeLeft] = useState(initialLeft)

  // 1초 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
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

  // ✅ 토큰 변경(Zustand) 시 남은 시간 재계산
  useEffect(() => {
    // 초기 동기화
    setTimeLeft(calcLeft())

    // ✅ selector 없이 한 개 인수만 전달
    const unsub = useAuthStore.subscribe((state, prevState) => {
      if (state.accessToken !== prevState.accessToken) {
        setTimeLeft(calcLeft())
      }
    })

    return () => unsub()
  }, [maxUiSec])

  // 세션 연장 (refresh 쿠키 기반 재발급)
  async function extendSession() {
    try {
      const data = await reissue()
      const access = (data as ReissueResponseDTO)?.accessToken ?? null
      if (access) {
        // ✅ 메모리(Zustand)에만 저장하면 인터셉터가 알아서 Bearer 주입
        useAuthStore.getState().setAccessToken(access)
      }
      setTimeLeft(calcLeft())
    } catch {
      // 재발급 실패 시 만료 처리
      useAuthStore.getState().logout()
      setTimeLeft(0)
      opts?.onExpire?.()
    }
  }

  // 외부에서 강제 동기화가 필요할 때
  function resetFromToken() {
    setTimeLeft(calcLeft())
  }

  return { timeLeft, extendSession, resetFromToken }
}
