import { UserProvider } from "@/src/(public)/(login)/authentication/context/UserContext";
import "./globals.css";


export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-br">
            <UserProvider>
                <body>
                    {children}
                </body>
            </UserProvider>
        </html>
    );
}