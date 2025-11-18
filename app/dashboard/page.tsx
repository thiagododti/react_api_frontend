'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthProvider';
import { apiFetch } from '@/lib/api';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        (async () => {
            const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/protected/`);
            if (res.ok) {
                setData(await res.json());
            } else if (res.status === 401) {
                // já tratado pelo apiFetch, se chegou aqui é porque refresh falhou
                await logout();
            }
        })();
    }, [logout]);

    return (
        <main>
            <h1>Dashboard</h1>
            <p>Usuário: {user?.username ?? '—'}</p>
            <pre>{JSON.stringify(data, null, 2)}</pre>
            <button onClick={() => logout()}>Logout</button>
        </main>
    );
}