import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SessionProviderWrapper from '@/components/SessionProviderWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Smart Finance System',
  description: 'Personal Finance Management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
