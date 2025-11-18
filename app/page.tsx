// app/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
        if (token) router.replace('/dashboard');
        else router.replace('/login');
    }, [router]);

    return <div className="small">Redirecionando...</div>;
}