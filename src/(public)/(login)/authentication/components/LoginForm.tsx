// components/LoginForm.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { API_BASE } from "@/src/(public)/(login)/authentication/lib/auth";

export function LoginForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const form = e.currentTarget;
        const formData = new FormData(form);
        const username = formData.get('usuario');
        const password = formData.get('password');

        try {
            const res = await fetch(`${API_BASE}/token/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                // tratar erro (exibir mensagem)
                setLoading(false);
                return;
            }

            const data = await res.json();
            // espera { access: "...", refresh: "..." }
            // setCookies no client via document.cookie — usamos helper simples aqui:
            const setCookieClient = (name: string, value: string, expSec?: number) => {
                let cookie = `${name}=${encodeURIComponent(value)}; path=/;`;
                if (expSec) cookie += ` expires=${new Date(expSec * 1000).toUTCString()};`;
                document.cookie = cookie;
            };

            if (data.access) {
                // decodificar exp do access para configurar cookie
                const payload = JSON.parse(atob(data.access.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
                if (payload?.exp) setCookieClient('access_token', data.access, payload.exp);
                else setCookieClient('access_token', data.access);
            }
            if (data.refresh) {
                const rPayload = JSON.parse(atob(data.refresh.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
                if (rPayload?.exp) setCookieClient('refresh_token', data.refresh, rPayload.exp);
                else setCookieClient('refresh_token', data.refresh);
            }

            // redirecionar para home
            router.push('/');
        } catch (err) {
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
