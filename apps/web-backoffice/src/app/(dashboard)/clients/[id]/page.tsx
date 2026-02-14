import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { serverFetch } from '@/lib/api-server';
import { Button, Skeleton } from '@nexus/ui';
import { ArrowLeft } from 'lucide-react';
import { ClientDetail } from './_components/client-detail';

export const metadata: Metadata = {
  title: 'Detalhe do Cliente | Sarfaty',
};

interface ClientData {
  id: string;
  companyName: string;
  cnpj: string;
  tradeName: string | null;
  segmentId: string;
  creditProductId: string;
  phone: string;
  email: string;
  addressStreet: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  addressNeighborhood: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZip: string | null;
  requestedAmount: string | null;
  approvedAmount: string | null;
  hasGuarantees: boolean;
  isJudicialRecovery: boolean;
  status: string;
  assignedTo: string;
  createdAt: string | null;
  updatedAt: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
}

interface Segment {
  id: string;
  name: string;
}

interface CreditProduct {
  id: string;
  name: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

async function ClientDetailLoader({ clientId }: { clientId: string }) {
  try {
    const [clientRes, segmentsRes, productsRes] = await Promise.all([
      serverFetch<ClientData>(`/clients/${clientId}`),
      serverFetch<Segment[]>('/segments'),
      serverFetch<CreditProduct[]>('/segments/credit-products'),
    ]);

    const segmentNames: Record<string, string> = {};
    (segmentsRes.data ?? []).forEach((s) => { segmentNames[s.id] = s.name; });

    const productNames: Record<string, string> = {};
    (productsRes.data ?? []).forEach((p) => { productNames[p.id] = p.name; });

    return (
      <ClientDetail
        client={clientRes.data}
        segmentName={segmentNames[clientRes.data.segmentId] ?? '—'}
        productName={productNames[clientRes.data.creditProductId] ?? '—'}
      />
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        <p className="font-medium">Erro ao carregar cliente.</p>
        <p className="mt-1 text-xs opacity-90">{message}</p>
      </div>
    );
  }
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 8 }).map(() => (
          <Skeleton key={crypto.randomUUID()} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Detalhe do Cliente</h1>
        </div>
      </div>

      <Suspense fallback={<DetailSkeleton />}>
        <ClientDetailLoader clientId={id} />
      </Suspense>
    </div>
  );
}
