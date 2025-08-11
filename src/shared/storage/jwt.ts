export function parseJwt(token: string) {
  try {
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/')));
    return payload; // { userId, role, name, sub, ... }
  } catch {
    return null;
  }
}
