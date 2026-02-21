import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/api-server';
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

export default async function DraweePage({ params }: PageProps) {
  const { id } = await params;
  const result = await serverFetch<Drawee>(`/drawees/${id}`);

  if (!result?.data) {
    notFound();
  }

  return <DraweeDetail drawee={result.data} />;
}
