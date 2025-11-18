// fetch wrapper com refresh automático
// Uso: import { apiFetch, setAccessToken } from 'lib/api'

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

// Acesso do AuthContext para setar token em memória
export function setAccessToken(token: string | null) {
    accessToken = token;
}

// Função para chamar endpoint de refresh (backend deve ler cookie httpOnly)
async function doRefresh(): Promise<string | null> {
    // Se já há um refresh em andamento, reutiliza
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // importantíssimo: envia cookies (onde está o refresh httpOnly)
                credentials: 'include',
                // se backend espera token no corpo: {} ou vazio dependendo da customização
                body: JSON.stringify({}),
            });

            if (!res.ok) {
                // refresh falhou -> forçar logout no frontend (quem chamou tratará)
                refreshPromise = null;
                return null;
            }

            const data = await res.json();
            // assumimos que o backend devolve { access: "..." }
            const newAccess = data.access;
            accessToken = newAccess;
            refreshPromise = null;
            return newAccess;
        } catch (err) {
            refreshPromise = null;
            return null;
        }
    })();

    return refreshPromise;
}

// wrapper que anexa Authorization e re-tenta depois de refresh
export async function apiFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
    init = { ...init };

    // include cookies sempre que preciso (refresh/login dependem disso)
    init.credentials = init.credentials ?? 'include';

    init.headers = {
        ...(init.headers || {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    let res = await fetch(input, init);

    // Se 401 e não era tentativa de refresh, tenta obter novo access e re-tentar
    if (res.status === 401) {
        const newAccess = await doRefresh();
        if (newAccess) {
            // re-tenta request original com novo token
            init.headers = {
                ...(init.headers || {}),
                Authorization: `Bearer ${newAccess}`,
            };
            res = await fetch(input, init);
        }
    }

    return res;
}