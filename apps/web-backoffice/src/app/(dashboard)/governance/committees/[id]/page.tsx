import type { Metadata } from 'next';
import { CommitteeDetail } from './_components/committee-detail';

export const metadata: Metadata = { title: 'Comitê | Sarfaty' };

export default async function CommitteeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CommitteeDetail id={id} />;
}
