'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@nexus/ui';
import { api } from '@/lib/api';
import { REIMBURSEMENT_STATUS_LABELS } from '@nexus/utils';
import { ReimbursementsTable } from '../../_components/reimbursements-table';
import { CreateReimbursementDialog } from '../../_components/create-reimbursement-dialog';

interface Reimbursement {
  id: string;
  collaboratorId: string;
  title: string;
  description: string | null;
  category: string;
  amount: string;
  expenseDate: string;
  status: string;
  receiptFileName: string | null;
  receiptPath: string | null;
  approvedBy: string | null;
  [key: string]: unknown;
}

interface ListReimbursementsResponse {
  data: Reimbursement[];
  total: number;
}

export default function MyReimbursementsPage() {
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);

  async function loadReimbursements() {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: 1,
        pageSize: 50,
      };
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;

      const response = await api.get<ListReimbursementsResponse>(
        '/people/reimbursements',
        params,
      );

      const res = response as unknown as ListReimbursementsResponse;
      setReimbursements(res.data ?? []);
    } catch {
      setReimbursements([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReimbursements();
  }, [statusFilter]);

  if (loading && reimbursements.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Meus Reembolsos</h1>
        <p className="text-sm text-muted-foreground">
          Solicite e acompanhe seus reembolsos de despesas
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="space-y-2">
          <label htmlFor="filter-status" className="text-sm font-medium">
            Status
          </label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="filter-status" className="w-48">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(REIMBURSEMENT_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ReimbursementsTable
        reimbursements={reimbursements}
        onRefresh={loadReimbursements}
        mode="mine"
        onCreateClick={() => setCreateOpen(true)}
      />

      <CreateReimbursementDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={loadReimbursements}
      />
    </div>
  );
}
