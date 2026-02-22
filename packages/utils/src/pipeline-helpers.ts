import type { ClientStatus, FunnelStage } from '@nexus/types';

export const FUNNEL_STAGE_STATUSES: Record<FunnelStage, [ClientStatus, ...ClientStatus[]]> = {
  prospecting: ['draft'],
  documentation: ['pending_documents', 'document_issues'],
  analysis: ['document_validation', 'credit_analysis'],
  approval: ['pending_report', 'pending_approval'],
  approved: ['approved', 'pending_partner_docs', 'partner_doc_validation'],
  active: ['pending_homologation', 'homologated', 'active'],
  lost: ['auto_rejected', 'rejected', 'cancelled'],
};

export const FUNNEL_STAGE_LABELS: Record<FunnelStage, string> = {
  prospecting: 'Prospecção',
  documentation: 'Documentação',
  analysis: 'Análise',
  approval: 'Aprovação',
  approved: 'Aprovado',
  active: 'Ativo',
  lost: 'Perdido',
};

export const FUNNEL_STAGE_ICONS: Record<FunnelStage, string> = {
  prospecting: 'Pencil',
  documentation: 'FileText',
  analysis: 'Search',
  approval: 'Clock',
  approved: 'CheckCircle2',
  active: 'Activity',
  lost: 'XCircle',
};

export const FUNNEL_STAGE_COLORS: Record<FunnelStage, string> = {
  prospecting: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',
  documentation: 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700',
  analysis: 'bg-violet-50 text-violet-700 border-violet-300 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-700',
  approval: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700',
  active: 'bg-teal-50 text-teal-700 border-teal-300 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-700',
  lost: 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-700',
};

export const FUNNEL_STAGE_ORDER: FunnelStage[] = [
  'prospecting',
  'documentation',
  'analysis',
  'approval',
  'approved',
  'active',
  'lost',
];

export function getStatusFunnelStage(status: ClientStatus): FunnelStage {
  for (const [stage, statuses] of Object.entries(FUNNEL_STAGE_STATUSES) as [FunnelStage, ClientStatus[]][]) {
    if (statuses.includes(status)) return stage;
  }
  return 'lost';
}

export function getFunnelStageLabel(stage: FunnelStage): string {
  return FUNNEL_STAGE_LABELS[stage];
}

/**
 * Returns the first valid target status when dropping a card into a funnel stage.
 * Used by the Kanban to determine which status transition to attempt.
 */
export function getDropTargetStatus(stage: FunnelStage): ClientStatus {
  return FUNNEL_STAGE_STATUSES[stage][0];
}
