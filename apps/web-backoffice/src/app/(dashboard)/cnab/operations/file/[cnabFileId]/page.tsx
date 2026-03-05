import { redirect } from 'next/navigation';
import { serverFetch } from '@/lib/api-server';

interface PageProps {
  params: Promise<{ cnabFileId: string }>;
}

export default async function OperationByFilePage({ params }: PageProps) {
  const { cnabFileId } = await params;

  try {
    const response = await serverFetch<{ operation: { id: string }; receivables: unknown[] }>(
      `/cnab/operations/by-file/${cnabFileId}`,
    );
    const data = response?.data as { operation: { id: string }; receivables: unknown[] } | undefined;
    if (data?.operation?.id) {
      redirect(`/cnab/operations/${data.operation.id}`);
    }
  } catch {
    // Operation not found - redirect to operations list
  }
  redirect('/cnab/operations');
}
