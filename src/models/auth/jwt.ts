export type JwtRole = 'USER' | 'HOST' | 'ADMIN'
export type JwtPayload = {
  sub: string;         
  name: string;
  userId: number;
  role: JwtRole;
  exp?: number; iat?: number;
}

export function parseJwt<T extends object = Record<string, unknown>>(token: string): T | null {
  try {
    const [, part] = token.split('.')
    if (!part) return null
    let b64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const pad = b64.length % 4
    if (pad) b64 += '='.repeat(4 - pad)
    const json = atob(b64)
    return JSON.parse(json) as T
  } catch {
    return null
  }
}