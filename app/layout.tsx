import { UserProvider } from "@/src/context/(user)/UserContext";
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