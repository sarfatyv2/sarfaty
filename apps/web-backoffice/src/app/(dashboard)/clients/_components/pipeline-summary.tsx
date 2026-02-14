'use client';

import {
  Pencil,
  FileText,
  Search,
  CheckCircle2,
  Shield,
  Activity,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  getStatusPhase,
  PIPELINE_PHASE_ORDER,
  PIPELINE_PHASE_LABELS,
} from '@nexus/utils';
import type { PipelinePhase } from '@nexus/utils';
import { cn } from '@nexus/ui';

const PHASE_CONFIG: Record<PipelinePhase, { icon: LucideIcon; dot: string; active: string }> = {
  registration: {
    icon: Pencil,
    dot: 'bg-gray-400',
    active: 'border-gray-200 dark:border-gray-700',
  },
  documentation: {
    icon: FileText,
    dot: 'bg-blue-500',
    active: 'border-blue-200 dark:border-blue-800',
  },
  analysis: {
    icon: Search,
    dot: 'bg-violet-500',
    active: 'border-violet-200 dark:border-violet-800',
  },
  approval: {
    icon: CheckCircle2,
    dot: 'bg-emerald-500',
    active: 'border-emerald-200 dark:border-emerald-800',
  },
  homologation: {
    icon: Shield,
    dot: 'bg-indigo-500',
    active: 'border-indigo-200 dark:border-indigo-800',
  },
  operation: {
    icon: Activity,
    dot: 'bg-teal-500',
    active: 'border-teal-200 dark:border-teal-800',
  },
};

interface PipelineSummaryProps {
  clients: { status: string }[];
}

export function PipelineSummary({ clients }: PipelineSummaryProps) {
  const counts: Record<PipelinePhase, number> = {
    registration: 0,
    documentation: 0,
    analysis: 0,
    approval: 0,
    homologation: 0,
    operation: 0,
  };

  for (const client of clients) {
    const phase = getStatusPhase(client.status);
    counts[phase] += 1;
  }

  const total = clients.length;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {PIPELINE_PHASE_ORDER.map((phase) => {
        const config = PHASE_CONFIG[phase];
        const Icon = config.icon;
        const count = counts[phase];
        const hasClients = count > 0;

        return (
          <div
            key={phase}
            className={cn(
              'relative flex flex-col items-center rounded-lg border bg-card px-2 py-3 text-center transition-all',
              hasClients ? config.active : 'border-transparent opacity-50',
            )}
          >
            {/* Dot indicator */}
            <div className={cn('h-1.5 w-1.5 rounded-full mb-2', hasClients ? config.dot : 'bg-muted-foreground/20')} />

            <Icon size={16} className={cn('mb-1', hasClients ? 'text-foreground' : 'text-muted-foreground/40')} />

            <span className={cn('text-lg font-bold leading-none', hasClients ? 'text-foreground' : 'text-muted-foreground/40')}>
              {count}
            </span>

            <span className="mt-1 text-[10px] font-medium text-muted-foreground leading-tight">
              {PIPELINE_PHASE_LABELS[phase]}
            </span>

            {/* Percentage bar */}
            {total > 0 && hasClients && (
              <div className="w-8 h-[2px] rounded-full bg-muted mt-2 overflow-hidden">
                <div
                  className={cn('h-full rounded-full', config.dot)}
                  style={{ width: `${Math.round((count / total) * 100)}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
