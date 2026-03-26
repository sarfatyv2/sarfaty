'use client';

import type { ReactNode } from 'react';
import { Badge } from '@nexus/ui';
import type { BadgeType, UpminerResultStatus } from './upminer.types';

export type { BadgeType } from './upminer.types';

export function StatusBadge({ value, type }: Readonly<{ value: string; type: BadgeType }>) {
  const colors: Record<BadgeType, string> = {
    success: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200',
    danger: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200',
    warning: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200',
    neutral: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200',
  };
  return <Badge className={`${colors[type]} font-semibold px-2.5 py-0.5`}>{value}</Badge>;
}

export function upminerStatusBadge(status: UpminerResultStatus): { label: string; type: BadgeType } {
  const map: Record<UpminerResultStatus, { label: string; type: BadgeType }> = {
    PENDING: { label: 'Pendente', type: 'neutral' },
    QUEUED: { label: 'Na fila', type: 'warning' },
    PROCESSING: { label: 'Processando', type: 'warning' },
    PROCESSED: { label: 'Concluído', type: 'success' },
    ERROR: { label: 'Erro', type: 'danger' },
  };
  return map[status] ?? { label: status, type: 'neutral' };
}

export function InfoField({ label, value }: Readonly<{ label: string; value?: string | null }>) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-medium leading-none">{value || '—'}</p>
    </div>
  );
}

export function CardHeaderSmall({ icon, title }: Readonly<{ icon: ReactNode; title: string }>) {
  return (
    <div className="flex items-center gap-2 border-b bg-muted/20 px-4 py-2.5">
      <span className="text-primary">{icon}</span>
      <span className="text-sm font-semibold">{title}</span>
    </div>
  );
}

export function SectionTab({
  active,
  label,
  onClick,
}: Readonly<{ active: boolean; label: string; onClick: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
      }`}
    >
      {label}
    </button>
  );
}
