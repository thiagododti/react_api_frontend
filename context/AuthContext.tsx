// context/AuthContext.tsx
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { tokenStorage } from '../lib/storage';
import { authFetch } from '../lib/api';

type User = { id: number; username: string; first_name: string; last_name: string; email: string; is_staff?: boolean } | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

  useEffect(() => {
    const init = async () => {
      // tenta renovar access via cookie (se existir refresh cookie)
      try {
        await fetch(`${API_BASE}/api/token/refresh/`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        }).then(async res => {
          if (!res.ok) {
            tokenStorage.clear();
            setUser(null);
            return;
          }
          const data = await res.json();
          if (data.access) tokenStorage.setAccess(data.access);
          // agora busca usuário autenticado
          const uRes = await fetch(`${API_BASE}/api/usuario/autenticado/`, {
            headers: { 'Authorization': `Bearer ${tokenStorage.getAccess() || ''}` },
            credentials: 'include'
          });
          if (uRes.ok) setUser(await uRes.json());
          else setUser(null);
        });
      } catch {
        tokenStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [API_BASE]);

  async function refreshUser() {
    const res = await authFetch(`${API_BASE}/api/usuario/autenticado/`);
    if (!res.ok) { setUser(null); return; }
    const data = await res.json();
    setUser(data);
  }

  async function login(username: string, password: string) {
    setLoading(true);
    try {
      // inclua credentials: 'include' para que o backend possa setar cookie HttpOnly
      const res = await fetch(`${API_BASE}/api/token/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Erro no login');
      }
      const data = await res.json();
      if (data.access) tokenStorage.setAccess(data.access);
      // busca usuário
      await refreshUser();
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    // ideal: chamar endpoint logout que expire o cookie no backend
    try {
      await fetch(`${API_BASE}/api/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch {
      // ignore
    }
    tokenStorage.clear();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
