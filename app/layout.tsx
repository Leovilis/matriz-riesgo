// app/layout.tsx
import type { Metadata } from 'next';

// @ts-ignore
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Manzur Alertas - Riesgos y Oportunidades',
  description: 'Visor de alertas de riesgos y oportunidades',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  themeColor: '#0069B3',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Manzur Alertas',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Manzur Alertas" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}