import { useMemo } from 'react'
import { readCookie } from './cookie'
import { parseJwt, type JwtPayload } from './jwt'

export function useAuth() {
  const raw = readCookie('accessToken')
  return useMemo(() => {
    if (!raw) return { name: '', email: '', role: 'USER' as JwtPayload['role'] }
    const decoded = parseJwt<JwtPayload>(decodeURIComponent(raw))
    if (!decoded) return { name: '', email: '', role: 'USER' as JwtPayload['role'] }
    return { name: decoded.name, email: decoded.sub, role: decoded.role }
  }, [raw])
}