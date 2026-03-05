import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/api-server';
import { Skeleton } from '@nexus/ui';
import { ArrowLeft } from 'lucide-react';
import type { Drawee } from '@nexus/types';
import { DraweeDetail } from './_components/drawee-detail';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await serverFetch<Drawee>(`/drawees/${id}`);
  const name = result?.data?.companyName ?? 'Sacado';
  return { title: `${name} | Sarfaty` };
}

async function DraweeDetailLoader({ draweeId }: { draweeId: string }) {
  const result = await serverFetch<Drawee>(`/drawees/${draweeId}`);
  if (!result?.data) {
    notFound();
  }
  return <DraweeDetail drawee={result.data} />;
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 w-full rounded-2xl" />
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

export default async function DraweePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link
        href="/drawees"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Voltar para Sacados</span>
      </Link>

      <Suspense fallback={<DetailSkeleton />}>
        <DraweeDetailLoader draweeId={id} />
      </Suspense>
    </div>
  );
}
