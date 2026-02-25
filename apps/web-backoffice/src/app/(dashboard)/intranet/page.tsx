import type { Metadata } from 'next';
import { IntranetFeed } from './_components/intranet-feed';

export const metadata: Metadata = { title: 'Intranet | Sarfaty' };

export default function IntranetPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-normal">Intranet</h1>
        <p className="text-sm text-muted-foreground">
          Comunicados e novidades da empresa
        </p>
      </div>
      <IntranetFeed />
    </div>
  );
}
