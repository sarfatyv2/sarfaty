'use client';

import Link from 'next/link';
import { Building2, User, ChevronRight } from 'lucide-react';
import { cn } from '@nexus/ui';
import { DraweeStatusBadge } from './drawee-status-badge';
import type { Drawee } from '@nexus/types';

interface DraweesTableProps {
  drawees: Drawee[];
}

function formatDocument(drawee: Drawee): string {
  if (drawee.cnpj) {
    const d = drawee.cnpj.replaceAll(/\D/g, '');
    if (d.length === 14) return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    return drawee.cnpj;
  }
  if (drawee.cpf) {
    const d = drawee.cpf.replaceAll(/\D/g, '');
    if (d.length === 11) return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    return drawee.cpf;
  }
  return '—';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function DraweesTable({ drawees }: DraweesTableProps) {
  if (drawees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground font-medium">Nenhum sacado encontrado</p>
        <p className="text-sm text-muted-foreground/70">Ajuste os filtros ou cadastre um novo sacado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {drawees.map((drawee) => (
        <Link
          key={drawee.id}
          href={`/drawees/${drawee.id}`}
          className={cn(
            'flex items-center justify-between rounded-lg border bg-card p-4 transition-colors',
            'hover:bg-accent/50 hover:border-accent-foreground/20',
          )}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              {drawee.personType === 'individual' ? (
                <User size={18} className="text-muted-foreground" />
              ) : (
                <Building2 size={18} className="text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium text-sm">{drawee.companyName}</p>
              {drawee.tradeName && (
                <p className="text-xs text-muted-foreground">{drawee.tradeName}</p>
              )}
              <p className="text-xs text-muted-foreground">{formatDocument(drawee)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground">Cadastrado em</p>
              <p className="text-sm">{formatDate(drawee.createdAt)}</p>
            </div>
            {drawee.isPep && (
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                PEP
              </span>
            )}
            <DraweeStatusBadge status={drawee.status} />
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
        </Link>
      ))}
    </div>
  );
}
