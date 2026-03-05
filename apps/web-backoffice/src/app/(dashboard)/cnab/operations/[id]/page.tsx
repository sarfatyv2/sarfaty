import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/api-server';
import { Button } from '@nexus/ui';
import { ArrowLeft } from 'lucide-react';
import { OperationDetail } from './_components/operation-detail';

export const metadata: Metadata = {
  title: 'Operação CNAB | Sarfaty',
  description: 'Detalhes da operação e avaliação de duplicatas',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

interface OperationData {
  operation: {
    id: string;
    clientId: string;
    cnabFileId: string;
    status: string;
    totalSubmittedAmount: string;
    totalApprovedAmount: string;
    createdAt: string | null;
    updatedAt: string | null;
  };
  receivables: Array<{
    id: string;
    documentNumber: string | null;
    draweeName: string | null;
    draweeDoc: string | null;
    draweeDocType: string | null;
    dueDate: string | null;
    faceValue: string | null;
    status: string;
    operationId: string | null;
    evaluationStatus: string;
    rejectionReason: string | null;
  }>;
}

export default async function OperationDetailPage({ params }: PageProps) {
  const { id } = await params;

  let data: OperationData;
  try {
    const response = await serverFetch<{ operation: OperationData['operation']; receivables: OperationData['receivables'] }>(
      `/cnab/operations/${id}`,
    );
    const responseData = response?.data as { operation: OperationData['operation']; receivables: OperationData['receivables'] } | undefined;
    if (!responseData?.operation) notFound();
    data = responseData;
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/cnab/operations">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-normal">Operação</h1>
          <p className="text-sm text-muted-foreground">Avalie as duplicatas e defina o crédito liberado</p>
        </div>
      </div>

      <OperationDetail operation={data.operation} receivables={data.receivables} />
    </div>
  );
}
