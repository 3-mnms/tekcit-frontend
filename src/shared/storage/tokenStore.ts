let accessToken: string | null = null;

const KEY = 'accessToken';

export const tokenStore = {
  get() {
    return accessToken ?? localStorage.getItem(KEY);
  },
  set(token: string | null) {
    accessToken = token;
    if (token) localStorage.setItem(KEY, token);
    else localStorage.removeItem(KEY);
  },
  clear() {
    accessToken = null;
    localStorage.removeItem(KEY);
  },
};
