"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { decodeJwtPayload, getCookie, deleteCookie } from "@/src/(public)/(login)/authentication/lib/auth";
import { apiFetch } from "@/src/(public)/(login)/authentication/lib/apiClient";
import { useRouter } from "next/navigation";
import { User, UserContextValue } from "../types/UserTypes";

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    const fetchUser = async (userId: string) => {
        try {
            // usa seu apiFetch (que lida com refresh de token)
            const res = await apiFetch(`/usuario/${userId}/`);
            if (!res.ok) {
                setUser(null);
                return;
            }
            const data = await res.json();
            setUser(data);
        } catch (error) {
            setUser(null);
        }
    };

    const refreshUser = async () => {
        setLoading(true);
        try {
            const access = getCookie("access_token");
            if (!access) {
                setUser(null);
                return;
            }
            const payload = decodeJwtPayload(access);
            const userId = payload?.user_id ?? payload?.sub ?? null;
            if (userId) {
                await fetchUser(String(userId));
            } else {
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let previousToken = getCookie("access_token");

        // Verificar a cada 500ms se o token mudou
        const interval = setInterval(() => {
            const currentToken = getCookie("access_token");

            // Se o token mudou (novo login), refresh dos dados
            if (currentToken !== previousToken && currentToken) {
                previousToken = currentToken;
                refreshUser();
            }
        }, 500);

        // Também executar na primeira montagem
        refreshUser();

        return () => clearInterval(interval);
    }, []);

    const signOut = () => {
        // Limpa cookies e redireciona para /login
        deleteCookie("access_token");
        deleteCookie("refresh_token");
        setUser(null);
        router.push("/login");
    };

    return (
        <UserContext.Provider value={{ user, loading, refreshUser, signOut }}>
            {children}
        </UserContext.Provider>
    );
};

export function useUserContext() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUserContext must be used within UserProvider");
    return ctx;
}
