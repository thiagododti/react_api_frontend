'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, setAccessToken } from '@/lib/api';

type User = { id: number; username: string } | null;

type AuthContextType = {
    user: User;
    access: string | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshAccessManually: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [access, setAccess] = useState<string | null>(null);
    const [user, setUser] = useState<User>(null);

    useEffect(() => {
        // atualiza a variável do módulo lib/api
        setAccessToken(access);
    }, [access]);

    // Tenta buscar um novo access usando refresh cookie
    async function refreshAccessManually() {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({}),
        });
        if (!res.ok) {
            setAccess(null);
            setUser(null);
            setAccessToken(null);
            return false;
        }
        const data = await res.json();
        setAccess(data.access);
        setAccessToken(data.access);
        // opcional: buscar usuário atual
        await fetchUser(data.access);
        return true;
    }

    async function fetchUser(token?: string) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios/`, {
                headers: {
                    Authorization: `Bearer ${token ?? access}`,
                },
                credentials: 'include',
            });
            if (!res.ok) {
                setUser(null);
                return;
            }
            const data = await res.json();
            setUser(data);
        } catch {
            setUser(null);
        }
    }

    async function login(username: string, password: string) {
        // O backend deve setar refresh cookie httpOnly; retornar access no body
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // aceita cookies do backend
            body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
            return false;
        }
        const data = await res.json();
        setAccess(data.access);
        setAccessToken(data.access);

        // buscar dados do usuário (opcional)
        await fetchUser(data.access);
        return true;
    }

    async function logout() {
        // chama backend para invalidar refresh (blacklist) e limpar cookie
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout/`, {
            method: 'POST',
            credentials: 'include',
        });
        setAccess(null);
        setAccessToken(null);
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, access, login, logout, refreshAccessManually }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}