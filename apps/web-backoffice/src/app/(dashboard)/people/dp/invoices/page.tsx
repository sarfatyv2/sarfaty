'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Button,
} from '@nexus/ui';
import { PJ_INVOICE_STATUS_LABELS } from '@nexus/utils';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { InvoicesTable } from '../../_components/invoices-table';

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

interface ListInvoicesResponse {
  data: PjInvoice[];
  total: number;
}

interface ListCollaboratorsResponse {
  data: CollaboratorRow[];
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

export default function DpInvoicesPage() {
  const [invoices, setInvoices] = useState<PjInvoice[]>([]);
  const [collaboratorNames, setCollaboratorNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<number>(CURRENT_YEAR);
  const [monthFilter, setMonthFilter] = useState<number | ''>('');
  const [sendingReminders, setSendingReminders] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: 1,
        pageSize: 50,
      };
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (yearFilter) params.referenceYear = yearFilter;
      if (monthFilter) params.referenceMonth = monthFilter;

      const [invRes, collabRes] = await Promise.all([
        api.get<{ data: PjInvoice[]; total: number }>('/people/invoices', params),
        api.get<ListCollaboratorsResponse>('/people/collaborators', {
          page: 1,
          pageSize: 100,
        }),
      ]);

      const invData = invRes as unknown as ListInvoicesResponse;
      const collabData = collabRes as unknown as ListCollaboratorsResponse;

      setInvoices(invData.data ?? []);
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
  }, [statusFilter, yearFilter, monthFilter]);

  async function handleSendReminders() {
    setSendingReminders(true);
    try {
      const res = await api.post<{ data: { count: number } }>(
        '/people/invoices/send-reminders',
      );
      const data = res as unknown as { data?: { count?: number } };
      const count = data.data?.count ?? 0;
      if (count > 0) {
        toast.success(`${count} lembretes enviados`);
      } else {
        toast.info('Nenhum lembrete a enviar');
      }
    } catch {
      toast.error('Erro ao enviar lembretes');
    } finally {
      setSendingReminders(false);
    }
  }

  async function handleGenerateMonthly() {
    setGenerating(true);
    try {
      const res = await api.post<{ data: { created: number; skipped: number } }>(
        '/people/invoices/generate-monthly',
      );
      const data = res as unknown as { data?: { created?: number; skipped?: number } };
      const created = data.data?.created ?? 0;
      const skipped = data.data?.skipped ?? 0;
      toast.success(`Criadas ${created} NFs, ${skipped} já existiam`);
      loadData();
    } catch {
      toast.error('Erro ao gerar NFs');
    } finally {
      setGenerating(false);
    }
  }

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
          <h1 className="text-2xl font-bold">Notas Fiscais PJ</h1>
          <p className="text-sm text-muted-foreground">
            Fila de notas fiscais para conferência e pagamento
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateMonthly}
            disabled={generating}
          >
            Gerar NFs do mês
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendReminders}
            disabled={sendingReminders}
          >
            <Bell size={14} className="mr-2" />
            Enviar lembretes
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/people/dp/invoices/overdue">Atrasadas</Link>
          </Button>
        </div>
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
              {Object.entries(PJ_INVOICE_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label htmlFor="filter-year" className="text-sm font-medium">
            Ano
          </label>
          <Select value={String(yearFilter)} onValueChange={(v) => setYearFilter(Number(v))}>
            <SelectTrigger id="filter-year" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label htmlFor="filter-month" className="text-sm font-medium">
            Mês
          </label>
          <Select
            value={monthFilter === '' ? 'all' : String(monthFilter)}
            onValueChange={(v) => setMonthFilter(v === 'all' ? '' : Number(v))}
          >
            <SelectTrigger id="filter-month" className="w-36">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {[
                'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
              ].map((m, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
