// components/LoginForm.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { API_BASE, decodeJwtPayload } from "@/src/(public)/(login)/authentication/lib/auth";
import type { LoginResponse } from "@/src/(public)/(login)/authentication/types/authTypes";

export function LoginForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const setCookieClient = (name: string, value: string, expSec?: number): void => {
        let cookie = `${name}=${encodeURIComponent(value)}; path=/;`;
        if (expSec) cookie += ` expires=${new Date(expSec * 1000).toUTCString()};`;
        document.cookie = cookie;
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const form = e.currentTarget;
        const formData = new FormData(form);
        const username = formData.get('usuario') as string;
        const password = formData.get('password') as string;

        try {
            const res = await fetch(`${API_BASE}/token/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                setError('Usuário ou senha incorretos');
                setLoading(false);
                return;
            }

            const data: LoginResponse = await res.json();
            // espera { access: "...", refresh: "..." }

            if (data.access) {
                const payload = decodeJwtPayload(data.access);
                if (payload?.exp) {
                    setCookieClient('access_token', data.access, payload.exp);
                } else {
                    setCookieClient('access_token', data.access);
                }
            }

            if (data.refresh) {
                const rPayload = decodeJwtPayload(data.refresh);
                if (rPayload?.exp) {
                    setCookieClient('refresh_token', data.refresh, rPayload.exp);
                } else {
                    setCookieClient('refresh_token', data.refresh);
                }
            }

            // redirecionar para home
            router.push('/');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao conectar com o servidor';
            setError(errorMessage);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                                {error}
                            </div>
                        )}
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="usuario">Usuário</FieldLabel>
                                <Input id="usuario" name="usuario" type="text" placeholder="Digite seu usuário" required />
                            </Field>
                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">Senha</FieldLabel>
                                </div>
                                <Input id="password" name="password" type="password" required />
                            </Field>
                            <Field>
                                <Button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Login'}</Button>
                                <Button variant="outline" type="button">Registrar</Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default LoginForm;
