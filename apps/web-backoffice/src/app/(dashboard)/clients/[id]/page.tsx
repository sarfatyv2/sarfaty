import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { serverFetch } from '@/lib/api-server';
import { Skeleton } from '@nexus/ui';
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
        segments={segmentsRes.data ?? []}
        products={productsRes.data ?? []}
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
      {/* Header skeleton */}
      <Skeleton className="h-28 w-full rounded-2xl" />
      {/* Partners skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
      {/* Faturamento skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
      {/* Tabs skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-9 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          {['sk-0', 'sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5'].map((k) => (
            <Skeleton key={k} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link href="/clients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} />
        <span>Voltar para Clientes</span>
      </Link>

      <Suspense fallback={<DetailSkeleton />}>
        <ClientDetailLoader clientId={id} />
      </Suspense>
    </div>
  );
}
