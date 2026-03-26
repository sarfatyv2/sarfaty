'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Card, CardContent, Badge, Button, ScrollArea } from '@nexus/ui';
import { Code2, Loader2 } from 'lucide-react';
import { ExpandableContent, RotatingChevron } from '../motion-wrapper';
import type { BadgeType, ComplianceCheckName } from './credit-analysis.types';
import { formatDate } from './credit-analysis.utils';

export type { BadgeType } from './credit-analysis.types';

export function StatusBadge({ value, type }: Readonly<{ value: string | null | undefined; type: BadgeType }>) {
  if (!value) return <span className="text-sm font-medium">—</span>;

  const colors: Record<BadgeType, string> = {
    success: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200',
    danger: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200',
    warning: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200',
    neutral: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200',
  };

  return (
    <Badge className={`${colors[type]} font-semibold px-2.5 py-0.5`}>
      {value}
    </Badge>
  );
}

export function InfoField({ label, value, valueNode }: Readonly<{
  label: string;
  value?: string | null | boolean | number;
  valueNode?: ReactNode;
}>) {
  const resolveDisplayValue = (v?: string | null | boolean | number): string | number => {
    if (typeof v === 'boolean') return v ? 'Sim' : 'Não';
    return v || '—';
  };

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {valueNode ? (
        <div>{valueNode}</div>
      ) : (
        <p className="text-sm font-medium leading-none">{resolveDisplayValue(value)}</p>
      )}
    </div>
  );
}

export function ExpandableHeader({ icon, title, subtitle, badge, isOpen, onToggle }: Readonly<{
  icon: ReactNode;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}>) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between px-8 py-5 cursor-pointer text-left"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium">{title}</span>
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        {badge}
      </div>
      <RotatingChevron isOpen={isOpen} className="text-muted-foreground" />
    </button>
  );
}

export function CheckRow({ label, icon, hasMatch, detail, queriedAt, rawData, viewRaw, onToggleRaw }: Readonly<{
  label: string;
  icon: ReactNode;
  hasMatch: boolean | null;
  detail?: string | null;
  queriedAt?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawData?: any;
  viewRaw?: boolean;
  onToggleRaw?: () => void;
}>) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
          {hasMatch === true && <StatusBadge value="Encontrado" type="danger" />}
          {hasMatch === false && <StatusBadge value="Nada consta" type="success" />}
          {hasMatch === null && <StatusBadge value="N/A" type="neutral" />}
        </div>
        <div className="flex items-center gap-2">
          {queriedAt && <span className="text-[10px] text-muted-foreground">{formatDate(queriedAt)}</span>}
          {rawData && onToggleRaw && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggleRaw}>
              <Code2 size={11} className="text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>
      {detail && <p className="text-xs text-muted-foreground pl-6">{detail}</p>}
      {viewRaw && rawData && (
        <ScrollArea className="h-40 rounded-lg border bg-muted/30 p-3 ml-6">
          <pre className="text-xs">{JSON.stringify(rawData, null, 2)}</pre>
        </ScrollArea>
      )}
    </div>
  );
}

export function ComplianceSubCard({ icon, title, badge, children, defaultOpen = false }: Readonly<{
  icon: ReactNode;
  title: string;
  badge?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}>) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between px-5 py-3 cursor-pointer text-left bg-gradient-to-r from-primary/5 to-transparent"
        onClick={() => setIsOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{title}</span>
          {badge}
        </div>
        <RotatingChevron isOpen={isOpen} className="text-muted-foreground" />
      </button>
      <ExpandableContent isOpen={isOpen}>
        <CardContent className="pt-3">{children}</CardContent>
      </ExpandableContent>
    </Card>
  );
}

const PENDING_CHECK_LABELS: Record<ComplianceCheckName, { icon: ReactNode; title: string }> = {
  cgu: { icon: null, title: 'CGU — Portal da Transparência' },
  pep: { icon: null, title: 'PEP — Pessoas Expostas Politicamente' },
  pgfn: { icon: null, title: 'PGFN — Dívida Ativa da União' },
  cndt: { icon: null, title: 'CNDT — Débitos Trabalhistas (TST)' },
  addressValidation: { icon: null, title: 'Validação de Endereço' },
  sanctions: { icon: null, title: 'Sanções Internacionais (OFAC/UN)' },
  slaveLaborCheck: { icon: null, title: 'Lista de Trabalho Escravo (MTE)' },
  negativeMedia: { icon: null, title: 'Mídia Negativa — OSINT' },
  digitalPresence: { icon: null, title: 'Presença Digital' },
};

export function PendingCheckCard({ icon, title }: Readonly<{ icon: ReactNode; title: string }>) {
  return (
    <Card className="overflow-hidden opacity-60">
      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{title}</span>
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-semibold px-2.5 py-0.5 animate-pulse">
            Consultando...
          </Badge>
        </div>
        <Loader2 size={14} className="animate-spin text-muted-foreground" />
      </div>
    </Card>
  );
}

export { PENDING_CHECK_LABELS };

export function ComplianceCheckOrPending({ name, hasData, pendingChecks, children }: Readonly<{
  name: ComplianceCheckName;
  hasData: boolean;
  pendingChecks: ComplianceCheckName[];
  children: ReactNode;
}>) {
  if (hasData) return <>{children}</>;
  if (pendingChecks.includes(name)) return <PendingCheckCard {...PENDING_CHECK_LABELS[name]} />;
  return null;
}
