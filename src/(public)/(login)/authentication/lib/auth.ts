// src/lib/auth.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export function getCookie(name: string) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setCookie(name: string, value: string, expiresAtSeconds?: number) {
  let cookie = `${name}=${encodeURIComponent(value)}; path=/;`;
  if (expiresAtSeconds) {
    const expiresDate = new Date(expiresAtSeconds * 1000).toUTCString();
    cookie += ` expires=${expiresDate};`;
  }
  // para dev local sem https não usar Secure, em produção adicionar Secure; SameSite dependendo do comportamento desejado
  document.cookie = cookie;
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
}

// Decodifica payload do JWT sem dependências
export function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    // atob may throw; use try/catch
    const json = decodeURIComponent(
      atob(payload)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isTokenExpired(accessToken: string | null) {
  if (!accessToken) return true;
  const payload = decodeJwtPayload(accessToken);
  if (!payload || !payload.exp) return true;
  // exp is in seconds since epoch
  return Date.now() >= payload.exp * 1000;
}
