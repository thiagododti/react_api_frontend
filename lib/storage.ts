// lib/storage.ts
const ACCESS_KEY = 'access_token';

export const tokenStorage = {
  getAccess: () => typeof window !== 'undefined' ? localStorage.getItem(ACCESS_KEY) : null,
  setAccess: (v: string | null) => {
    if (typeof window === 'undefined') return;
    if (v) localStorage.setItem(ACCESS_KEY, v);
    else localStorage.removeItem(ACCESS_KEY);
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_KEY);
  }
};
