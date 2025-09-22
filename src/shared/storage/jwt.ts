export type JwtRole = 'USER' | 'HOST' | 'ADMIN'

export interface JwtPayloadBase {
  sub: string
  exp?: number
  iat?: number
  userId?: number
  role?: JwtRole
  name?: string
  [k: string]: unknown
}

function b64urlToUtf8(part: string): string {
  let b64 = part.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b64.length % 4
  if (pad) b64 += '='.repeat(4 - pad)
  if (typeof atob === 'function') {
    try {
      return decodeURIComponent(
        Array.prototype.map
          .call(atob(b64), (c: string) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join('')
      )
    } catch {
      return atob(b64)
    }
  }
  return Buffer.from(b64, 'base64').toString('utf8')
}

export function parseJwt<T extends object = JwtPayloadBase>(token: string): T | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    return JSON.parse(b64urlToUtf8(payload)) as T
  } catch {
    return null
  }
}
