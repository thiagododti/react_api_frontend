'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthProvider';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const ok = await login(username, password);
        if (!ok) {
            setError('Usuário ou senha inválidos');
            return;
        }
        router.push('/dashboard');
    }

    return (
        <main>
            <h1>Login</h1>
            <form onSubmit={onSubmit}>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuário" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" />
                <button type="submit">Entrar</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </main>
    );
}