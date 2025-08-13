// fe-admin/src/shared/utils/cookie.ts
export function readCookie(name: string) {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1] ?? null
}
export function deleteCookie(name: string) {
  document.cookie = `${name}=; Path=/; Max-Age=0`
}