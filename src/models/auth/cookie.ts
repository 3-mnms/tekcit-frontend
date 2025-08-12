export function setCookie(name: string, value: string, opts?: { maxAgeSec?: number }) {
  const isHttps = window.location.protocol === 'https:'
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',          
    'SameSite=Lax',    
  ]
  if (opts?.maxAgeSec) parts.push(`Max-Age=${opts.maxAgeSec}`)
  if (isHttps) parts.push('Secure') 
  document.cookie = parts.join('; ')
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; Path=/; Max-Age=0`
}
