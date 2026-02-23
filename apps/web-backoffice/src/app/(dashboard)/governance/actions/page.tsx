import type { Metadata } from 'next';
import { ActionItemsBoard } from './_components/action-items-board';

export const metadata: Metadata = { title: 'Planos de Ação | Sarfaty' };

export default function ActionItemsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Planos de Ação</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe e gerencie as ações designadas nos comitês
        </p>
      </div>
      <ActionItemsBoard />
    </div>
  );
}
