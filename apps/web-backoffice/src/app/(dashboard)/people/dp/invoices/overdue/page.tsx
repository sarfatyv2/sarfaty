'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Skeleton, Button } from '@nexus/ui';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { InvoicesTable } from '../../../_components/invoices-table';

interface PjInvoice {
  id: string;
  collaboratorId: string;
  referenceMonth: number;
  referenceYear: number;
  status: string;
  invoiceAmount: string;
  invoiceNumber: string | null;
  [key: string]: unknown;
}

interface CollaboratorRow {
  id: string;
  fullName: string;
  [key: string]: unknown;
}

interface ListCollaboratorsResponse {
  data: CollaboratorRow[];
}

export default function OverdueInvoicesPage() {
  const [invoices, setInvoices] = useState<PjInvoice[]>([]);
  const [collaboratorNames, setCollaboratorNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const [overdueRes, collabRes] = await Promise.all([
        api.get<{ data: PjInvoice[] }>('/people/invoices/overdue'),
        api.get<ListCollaboratorsResponse>('/people/collaborators', {
          page: 1,
          pageSize: 100,
        }),
      ]);

      const overdueData = overdueRes as unknown as { data?: PjInvoice[] };
      const collabData = collabRes as unknown as ListCollaboratorsResponse;

      setInvoices(overdueData.data ?? []);
      const names: Record<string, string> = {};
      (collabData.data ?? []).forEach((c) => {
        names[c.id] = c.fullName;
      });
      setCollaboratorNames(names);
    } catch {
      setInvoices([]);
      setCollaboratorNames({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading && invoices.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/people/dp/invoices">
                <ArrowLeft size={16} />
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold">Notas Fiscais Atrasadas</h1>
          <p className="text-sm text-muted-foreground">
            NFs pendentes de envio além do prazo
          </p>
        </div>
      </div>

      <InvoicesTable
        invoices={invoices}
        onRefresh={loadData}
        mode="dp"
        collaboratorNames={collaboratorNames}
      />
    </div>
  );
}
