// app/layout.tsx
import '../styles/globals.css';
import { ReactNode } from 'react';
import { AuthProvider } from '@/app/context/AuthProvider';

export const metadata = {
  title: 'My Next.js App',
  description: 'App frontend com Next.js e Django backend'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <div className="container">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
