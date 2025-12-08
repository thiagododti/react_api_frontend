"use client";
import { useUserContext } from "@/src/(public)/(login)/authentication/context/UserContext";

export function UserBadge() {
    const { user, loading, signOut } = useUserContext();

    if (loading) return <div>Carregando...</div>;
    if (!user) return null;

    const name = user.first_name || user.username || `${user.first_name ?? ""} ${user.last_name ?? ""}`;

    return (
        <div className="flex items-center gap-3">
            {/* Avatar simples */}
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm">
                {(user.first_name?.[0] ?? user.username?.[0] ?? "U").toUpperCase()}
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-medium">{name}</span>
                <button onClick={signOut} className="text-xs underline">
                    Sair
                </button>
            </div>
        </div>
    );
}

export default UserBadge;
