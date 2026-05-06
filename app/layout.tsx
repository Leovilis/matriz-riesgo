// app/layout.tsx
import type { Metadata } from 'next';

// @ts-ignore
import './globals.css';
import { Inter } from 'next/font/google';
import AuthProvider from '@/components/AuthProvider';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Manzur - Matriz de Riesgos',
  description: 'Sistema de Gestión de Calidad',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}