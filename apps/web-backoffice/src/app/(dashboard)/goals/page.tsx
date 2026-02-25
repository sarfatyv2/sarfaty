import type { Metadata } from 'next';
import { GoalsOverview } from './_components/goals-overview';

export const metadata: Metadata = { title: 'Metas | Sarfaty' };

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-normal">Metas Comerciais</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe metas individuais, de equipe e regionais
        </p>
      </div>
      <GoalsOverview />
    </div>
  );
}
