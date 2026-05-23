import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Portfolio — Andres Markic',
  description: 'Desarrollo web y aplicaciones móviles',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body style={{ fontFamily: 'var(--font-inter, system-ui)' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
