export type User = {
    id: string;
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    // adicione campos conforme seu /api/usuario/{id}/
};

export type UserContextValue = {
    user: User | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
    signOut: () => void;
};