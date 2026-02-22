import type { Metadata } from 'next';
import { WikiSidebar } from './_components/wiki-sidebar';

export const metadata: Metadata = {
  title: 'Wiki — Plataforma Sarfaty',
  description: 'Documentação técnica da Plataforma Sarfaty',
};

export default function WikiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full overflow-hidden">
      <WikiSidebar />
      <main className="flex-1 overflow-y-auto bg-[#f8f7f5]">
        {children}
      </main>
    </div>
  );
}
