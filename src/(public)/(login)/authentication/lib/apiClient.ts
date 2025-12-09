// src/lib/apiClient.ts
import { API_BASE, getCookie, setCookie, deleteCookie, isTokenExpired, decodeJwtPayload } from './auth';
import type { TokenRefreshResponse } from '../types/authTypes';

const REFRESH_ENDPOINT = `${API_BASE}/token/refresh/`; // ajuste se necessário
const TOKEN_ENDPOINT = `${API_BASE}/token/`; // endpoint de login

async function requestRefresh(): Promise<string | null> {
  const refreshToken = getCookie('refresh_token');
  if (!refreshToken) return null;

  try {
    const res = await fetch(REFRESH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }), // ajuste conforme sua API
      credentials: 'include',
    });

    if (!res.ok) {
      return null;
    }

    const data: TokenRefreshResponse = await res.json();
    // supondo resposta: { access: "...", refresh?: "..." }
    if (data.access) {
      const payload = decodeJwtPayload(data.access);
      const exp = payload?.exp;
      if (exp) setCookie('access_token', data.access, exp);
      else setCookie('access_token', data.access);

      if (data.refresh) {
        const refreshPayload = decodeJwtPayload(data.refresh);
        const refreshExp = refreshPayload?.exp;
        if (refreshExp) setCookie('refresh_token', data.refresh, refreshExp);
        else setCookie('refresh_token', data.refresh);
      }
      return data.access;
    }
    return null;
  } catch (err) {
    console.error('Token refresh error:', err);
    return null;
  }
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  // normalize url
  const url = typeof input === 'string' && input.startsWith('/') ? `${API_BASE}${input}` : input;
  let accessToken = getCookie('access_token');

  if (!accessToken || isTokenExpired(accessToken)) {
    // tenta renovar
    const newAccess = await requestRefresh();
    if (!newAccess) {
      // falhou no refresh -> limpar e forçar login
      deleteCookie('access_token');
      deleteCookie('refresh_token');
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Not authenticated');
    }
    accessToken = newAccess;
  }

  // merge headers
  const headers = new Headers(init.headers || {});
  headers.set('Authorization', `Bearer ${accessToken}`);
  if (!(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');

  const res = await fetch(url, { ...init, headers, credentials: 'include' });

  // Se a API retornou 401 pode ser que o access tenha expirado após envio; tenta renovar uma vez
  if (res.status === 401) {
    const newAccess = await requestRefresh();
    if (!newAccess) {
      deleteCookie('access_token');
      deleteCookie('refresh_token');
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Not authenticated');
    }
    headers.set('Authorization', `Bearer ${newAccess}`);
    const retry = await fetch(url, { ...init, headers, credentials: 'include' });
    return retry;
  }

  return res;
}
