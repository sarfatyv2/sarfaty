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
import { PJ_INVOICE_STATUS_LABELS } from '@nexus/utils';
import { InvoicesTable } from '../../_components/invoices-table';

interface PjInvoice {
  id: string;
  collaboratorId?: string;
  referenceMonth: number;
  referenceYear: number;
  status: string;
  invoiceAmount: string;
  invoiceNumber: string | null;
  [key: string]: unknown;
}


const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

export default function MyInvoicesPage() {
  const [invoices, setInvoices] = useState<PjInvoice[]>([]);
  const [, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<number>(CURRENT_YEAR);
  const [monthFilter, setMonthFilter] = useState<number | ''>('');

  async function loadInvoices() {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: 1,
        pageSize: 50,
      };
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (yearFilter) params.referenceYear = yearFilter;
      if (monthFilter) params.referenceMonth = monthFilter;

      const response = await api.get(
        '/people/invoices',
        params,
      );

      const res = response as unknown as { data?: PjInvoice[]; total?: number };
      setInvoices(res.data ?? []);
      setTotalCount(res.total ?? 0);
    } catch {
      setInvoices([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvoices();
  }, [statusFilter, yearFilter, monthFilter]);

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
      <div>
        <h1 className="text-2xl font-bold">Minhas Notas Fiscais</h1>
        <p className="text-sm text-muted-foreground">
          Envie suas notas fiscais mensais como colaborador PJ
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="space-y-2">
          <label htmlFor="filter-status" className="text-sm font-medium">Status</label>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v)}
          >
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
          <label htmlFor="filter-year" className="text-sm font-medium">Ano</label>
          <Select
            value={String(yearFilter)}
            onValueChange={(v) => setYearFilter(Number(v))}
          >
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
          <label htmlFor="filter-month" className="text-sm font-medium">Mês</label>
          <Select
            value={monthFilter === '' ? 'all' : String(monthFilter)}
            onValueChange={(v) =>
              setMonthFilter(v === 'all' ? '' : Number(v))
            }
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

      <InvoicesTable invoices={invoices} onRefresh={loadInvoices} mode="me" />
    </div>
  );
}
