import type { Metadata } from 'next';
import { CommitteesList } from './_components/committees-list';

export const metadata: Metadata = { title: 'Comitês | Sarfaty' };

export default function CommitteesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-normal">Comitês</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie as comissões e seus regulamentos
        </p>
      </div>
      <CommitteesList />
    </div>
  );
}
