'use client';

import Link from 'next/link';
import {
  Building2,
  Calendar,
  ChevronRight,
  ArrowRight,
  Users,
} from 'lucide-react';
import { cn } from '@nexus/ui';
import {
  getStatusMessage,
  isActionRequired,
} from '@nexus/utils';
import { ClientStatusBadge } from './client-status-badge';

interface ClientRow {
  id: string;
  companyName: string;
  cnpj: string;
  tradeName: string | null;
  segmentId: string;
  status: string;
  requestedAmount: string | null;
  createdAt: string | null;
}

interface ClientsTableProps {
  clients: ClientRow[];
  segmentNames: Record<string, string>;
}

function formatCnpj(cnpj: string): string {
  const digits = cnpj.replaceAll(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function formatCurrency(value: string | null): string {
  if (!value) return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function ClientCard({
  client,
  segmentName,
}: {
  client: ClientRow;
  segmentName: string;
}) {
  const message = getStatusMessage(client.status);
  const actionRequired = isActionRequired(client.status);

  return (
    <Link href={`/clients/${client.id}`} className="group block">
      <div
        className={cn(
          'rounded-xl border bg-card text-card-foreground shadow-sm',
          'transition-all duration-200',
          'hover:shadow-md hover:-translate-y-[1px]',
          'group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2',
        )}
      >
        <div className="px-7 py-6 sm:px-8">
          <div className="flex items-start gap-4">
            {/* Left: company info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <h3 className="text-[15px] font-semibold truncate group-hover:text-primary transition-colors">
                  {client.companyName}
                </h3>
                {client.tradeName && (
                  <span className="text-xs text-muted-foreground/70 truncate hidden sm:inline">
                    {client.tradeName}
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-muted-foreground/60 tracking-tight mt-0.5">
                {formatCnpj(client.cnpj)}
              </p>
            </div>

            {/* Right: amount */}
            <div className="text-right shrink-0">
              <p className="text-base font-bold tabular-nums">
                {formatCurrency(client.requestedAmount)}
              </p>
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                Solicitado
              </p>
            </div>
          </div>

          {/* Bottom row: chips + status + chevron */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Building2 size={11} className="shrink-0 opacity-50" />
              {segmentName}
            </span>

            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Calendar size={11} className="shrink-0 opacity-50" />
              {formatDate(client.createdAt)}
            </span>

            {/* Next step pill (desktop) */}
            {message && (
              <span
                className={cn(
                  'hidden lg:inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] shrink-0',
                  actionRequired
                    ? 'bg-secondary text-foreground font-medium'
                    : 'bg-muted/60 text-muted-foreground',
                )}
              >
                <ArrowRight size={10} className="shrink-0" />
                {message}
              </span>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            <ClientStatusBadge status={client.status} className="shrink-0" />

            <ChevronRight
              size={16}
              className="shrink-0 text-muted-foreground/30 group-hover:text-primary/60 group-hover:translate-x-0.5 transition-all"
            />
          </div>

          {/* Next step (mobile) */}
          {message && (
            <div
              className={cn(
                'flex items-center gap-1.5 mt-3 pt-3 border-t border-dashed text-xs lg:hidden',
                actionRequired
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground',
              )}
            >
              <ArrowRight size={11} className="shrink-0" />
              {message}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ClientsTable({ clients, segmentNames }: ClientsTableProps) {
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
          <Users size={22} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">Nenhum cliente encontrado</p>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs">
          Crie seu primeiro cliente clicando em &quot;Novo Cliente&quot; ou ajuste os filtros de busca.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {clients.map((client) => (
        <ClientCard
          key={client.id}
          client={client}
          segmentName={segmentNames[client.segmentId] ?? '—'}
        />
      ))}
    </div>
  );
}
