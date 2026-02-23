import type { Metadata } from 'next';
import { GovernanceDashboard } from './_components/governance-dashboard';

export const metadata: Metadata = { title: 'Governança Corporativa | Sarfaty' };

export default function GovernancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Governança Corporativa</h1>
        <p className="text-sm text-muted-foreground">
          Comitês, reuniões, atas e planos de ação
        </p>
      </div>
      <GovernanceDashboard />
    </div>
  );
}
