export interface JwtPayload {
    exp?: number;
    iat?: number;
    [key: string]: unknown;
}

export interface LoginResponse {
    access: string;
    refresh?: string;
}

export interface TokenRefreshResponse {
    access: string;
    refresh?: string;
}

export interface User {
    id: string;
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
}

export interface UserContextValue {
    user: User | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
    signOut: () => void;
}