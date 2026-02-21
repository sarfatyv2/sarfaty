import type { Metadata } from 'next';
import { Toaster } from '@nexus/ui';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sarfaty Platform',
  description: 'Plataforma corporativa integrada Sarfaty',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="font-sans h-full overflow-hidden">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
