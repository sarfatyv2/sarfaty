import type { Metadata } from 'next';
import { CommitteeDetail } from './_components/committee-detail';

export const metadata: Metadata = { title: 'Comitê | Sarfaty' };

export default function CommitteeDetailPage({ params }: { params: { id: string } }) {
  return <CommitteeDetail id={params.id} />;
}
