export const tokenStore = {
  get(): string | null {
    return localStorage.getItem('accessToken') 
  },
  set(token: string) {
    localStorage.setItem('accessToken', token)
    window.dispatchEvent(new Event('auth:token'))
  },
  clear() {
    localStorage.removeItem('accessToken')
    window.dispatchEvent(new Event('auth:token'))
  },
}