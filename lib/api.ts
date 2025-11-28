// lib/api.ts
import { tokenStorage } from './storage';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

async function refreshAccess(): Promise<string | null> {
  // envia cookie HttpOnly automaticamente
  const res = await fetch(`${API_BASE}/api/token/refresh/`, {
    method: 'POST',
    credentials: 'include', // importante: envia cookie HttpOnly
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}) // backend pode ler do cookie
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.access) {
    tokenStorage.setAccess(data.access);
    return data.access;
  }
  return null;
}

export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  let access = tokenStorage.getAccess();
  const headers = new Headers(init.headers || {});
  if (access) headers.set('Authorization', `Bearer ${access}`);
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json');

  let response = await fetch(input, { ...init, headers, credentials: init.credentials ?? 'include' });
  if (response.status === 401) {
    const newAccess = await refreshAccess();
    if (!newAccess) {
      tokenStorage.clear();
      return response;
    }
    // retry original request with new access
    headers.set('Authorization', `Bearer ${newAccess}`);
    response = await fetch(input, { ...init, headers, credentials: init.credentials ?? 'include' });
  }
  return response;
}
