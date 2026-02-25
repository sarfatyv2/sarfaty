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
  prospecting: 'bg-[hsl(38,25%,95%)] text-[hsl(38,30%,35%)] border-[hsl(38,25%,82%)]',
  documentation: 'bg-[hsl(38,25%,95%)] text-[hsl(38,30%,35%)] border-[hsl(38,25%,82%)]',
  analysis: 'bg-[hsl(38,25%,95%)] text-[hsl(38,30%,35%)] border-[hsl(38,25%,82%)]',
  approval: 'bg-[hsl(38,25%,95%)] text-[hsl(38,30%,35%)] border-[hsl(38,25%,82%)]',
  approved: 'bg-[hsl(38,25%,95%)] text-[hsl(38,30%,35%)] border-[hsl(38,25%,82%)]',
  active: 'bg-[hsl(38,25%,95%)] text-[hsl(38,30%,35%)] border-[hsl(38,25%,82%)]',
  lost: 'bg-[hsl(38,25%,95%)] text-[hsl(38,30%,35%)] border-[hsl(38,25%,82%)]',
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
