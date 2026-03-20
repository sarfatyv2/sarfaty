import type { Metadata } from 'next'; // v2026.03.20
import { Onest } from 'next/font/google';
import { Toaster } from '@nexus/ui';
import './globals.css';

const onest = Onest({
  subsets: ['latin'],
  variable: '--font-onest',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sarfaty Platform',
  description: 'Plataforma corporativa integrada Sarfaty',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`h-full ${onest.variable}`}>
      <body className="font-sans h-full overflow-hidden">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
