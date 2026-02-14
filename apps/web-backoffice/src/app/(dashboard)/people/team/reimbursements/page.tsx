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

interface CollaboratorRow {
  id: string;
  fullName: string;
  [key: string]: unknown;
}

interface ListReimbursementsResponse {
  data: Reimbursement[];
  total: number;
}

interface ListCollaboratorsResponse {
  data: CollaboratorRow[];
}

export default function TeamReimbursementsPage() {
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [collaboratorNames, setCollaboratorNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  async function loadData() {
    setLoading(true);
    try {
      const [reimbRes, collabRes] = await Promise.all([
        api.get<{ data: Reimbursement[]; total: number }>('/people/reimbursements', {
          status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
          page: 1,
          pageSize: 50,
        }),
        api.get<ListCollaboratorsResponse>('/people/collaborators', {
          page: 1,
          pageSize: 100,
        }),
      ]);

      const reimbData = reimbRes as unknown as ListReimbursementsResponse;
      const collabData = collabRes as unknown as ListCollaboratorsResponse;

      setReimbursements(reimbData.data ?? []);
      const names: Record<string, string> = {};
      (collabData.data ?? []).forEach((c) => {
        names[c.id] = c.fullName;
      });
      setCollaboratorNames(names);
    } catch {
      setReimbursements([]);
      setCollaboratorNames({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
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
        <h1 className="text-2xl font-bold">Reembolsos do Time</h1>
        <p className="text-sm text-muted-foreground">
          Aprove ou rejeite reembolsos dos colaboradores do seu time
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
        collaboratorNames={collaboratorNames}
        onRefresh={loadData}
        mode="team"
      />
    </div>
  );
}
