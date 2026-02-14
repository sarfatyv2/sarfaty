import type { ClientStatus } from '@nexus/types';

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  draft: 'Rascunho',
  pending_documents: 'Documentos Pendentes',
  document_validation: 'Validação de Documentos',
  document_issues: 'Documentos com Pendências',
  credit_analysis: 'Análise de Crédito',
  auto_rejected: 'Não Aprovado (automático)',
  pending_report: 'Aguardando Parecer',
  pending_approval: 'Aguardando Aprovação',
  approved: 'Aprovado',
  rejected: 'Não Aprovado',
  pending_partner_docs: 'Docs Sócios Pendentes',
  partner_doc_validation: 'Validação Docs Sócios',
  pending_homologation: 'Aguardando Homologação',
  homologated: 'Homologado',
  homologation_issues: 'Homologação com Pendências',
  active: 'Ativo',
  risk_management: 'Gestão de Risco',
  recovery: 'Recuperação',
  litigation: 'Contencioso',
  settled: 'Encerrado',
  cancelled: 'Cancelado',
};

export type StatusColor = 'default' | 'secondary' | 'destructive' | 'outline';

export const CLIENT_STATUS_COLORS: Record<ClientStatus, StatusColor> = {
  draft: 'secondary',
  pending_documents: 'outline',
  document_validation: 'outline',
  document_issues: 'destructive',
  credit_analysis: 'outline',
  auto_rejected: 'destructive',
  pending_report: 'outline',
  pending_approval: 'outline',
  approved: 'default',
  rejected: 'destructive',
  pending_partner_docs: 'outline',
  partner_doc_validation: 'outline',
  pending_homologation: 'outline',
  homologated: 'default',
  homologation_issues: 'destructive',
  active: 'default',
  risk_management: 'destructive',
  recovery: 'destructive',
  litigation: 'destructive',
  settled: 'secondary',
  cancelled: 'secondary',
};

export const CLIENT_STATUS_MESSAGES: Record<string, string> = {
  draft: 'Complete os dados do cliente',
  pending_documents: 'Envie os documentos pendentes',
  document_issues: 'Corrija os documentos sinalizados',
  document_validation: 'Documentos em análise',
  credit_analysis: 'Em análise de crédito',
  auto_rejected: 'Operação não aprovada',
  pending_report: 'Aguardando parecer',
  pending_approval: 'Aguardando aprovação',
  approved: 'Crédito aprovado',
  rejected: 'Operação não aprovada',
  pending_partner_docs: 'Aguardando docs dos sócios',
  partner_doc_validation: 'Validando docs dos sócios',
  pending_homologation: 'Aguardando homologação',
  homologated: 'Homologação concluída',
  homologation_issues: 'Homologação com pendências',
  active: 'Crédito ativo',
  risk_management: 'Em gestão de risco',
  recovery: 'Em recuperação',
  litigation: 'Em contencioso',
  settled: 'Operação encerrada',
  cancelled: 'Operação cancelada',
};

export type PipelinePhase =
  | 'registration'
  | 'documentation'
  | 'analysis'
  | 'approval'
  | 'homologation'
  | 'operation';

export const CLIENT_STATUS_PHASE: Record<ClientStatus, PipelinePhase> = {
  draft: 'registration',
  pending_documents: 'documentation',
  document_validation: 'documentation',
  document_issues: 'documentation',
  pending_partner_docs: 'documentation',
  partner_doc_validation: 'documentation',
  credit_analysis: 'analysis',
  pending_report: 'analysis',
  auto_rejected: 'analysis',
  pending_approval: 'approval',
  approved: 'approval',
  rejected: 'approval',
  pending_homologation: 'homologation',
  homologated: 'homologation',
  homologation_issues: 'homologation',
  active: 'operation',
  risk_management: 'operation',
  recovery: 'operation',
  litigation: 'operation',
  settled: 'operation',
  cancelled: 'operation',
};

export const PIPELINE_PHASE_LABELS: Record<PipelinePhase, string> = {
  registration: 'Cadastro',
  documentation: 'Documentação',
  analysis: 'Análise',
  approval: 'Aprovação',
  homologation: 'Homologação',
  operation: 'Operação',
};

export const PIPELINE_PHASE_ORDER: PipelinePhase[] = [
  'registration',
  'documentation',
  'analysis',
  'approval',
  'homologation',
  'operation',
];

/**
 * Lucide icon name per status.
 * The frontend maps these strings to actual icon components.
 */
export const CLIENT_STATUS_ICON: Record<ClientStatus, string> = {
  draft: 'Pencil',
  pending_documents: 'FileText',
  document_validation: 'FileClock',
  document_issues: 'FileWarning',
  pending_partner_docs: 'FileText',
  partner_doc_validation: 'FileClock',
  credit_analysis: 'Search',
  pending_report: 'ClipboardList',
  auto_rejected: 'XCircle',
  pending_approval: 'Clock',
  approved: 'CheckCircle2',
  rejected: 'XCircle',
  pending_homologation: 'Shield',
  homologated: 'ShieldCheck',
  homologation_issues: 'ShieldAlert',
  active: 'Activity',
  risk_management: 'AlertTriangle',
  recovery: 'RefreshCw',
  litigation: 'Gavel',
  settled: 'Archive',
  cancelled: 'Ban',
};

/**
 * Tailwind class sets per phase — uses only global theme tokens.
 */
export const PIPELINE_PHASE_STYLE: Record<PipelinePhase, string> = {
  registration: 'bg-muted text-muted-foreground',
  documentation: 'bg-secondary text-secondary-foreground',
  analysis: 'bg-secondary text-secondary-foreground',
  approval: 'bg-primary/10 text-primary',
  homologation: 'bg-secondary text-secondary-foreground',
  operation: 'bg-primary/10 text-primary',
};

/** Override phase style for negative/warning statuses */
export const CLIENT_STATUS_STYLE_OVERRIDE: Partial<Record<ClientStatus, string>> = {
  document_issues: 'bg-destructive/10 text-destructive',
  auto_rejected: 'bg-destructive/10 text-destructive',
  rejected: 'bg-destructive/10 text-destructive',
  homologation_issues: 'bg-destructive/10 text-destructive',
  risk_management: 'bg-destructive/10 text-destructive',
  recovery: 'bg-destructive/10 text-destructive',
  litigation: 'bg-destructive/10 text-destructive',
  cancelled: 'bg-muted text-muted-foreground',
};

/** Status where the commercial user needs to take action */
export const ACTION_REQUIRED_STATUSES: ClientStatus[] = [
  'draft',
  'pending_documents',
  'document_issues',
];

export function getStatusLabel(status: string): string {
  return CLIENT_STATUS_LABELS[status as ClientStatus] ?? status;
}

export function getStatusColor(status: string): StatusColor {
  return CLIENT_STATUS_COLORS[status as ClientStatus] ?? 'secondary';
}

export function getStatusMessage(status: string): string {
  return CLIENT_STATUS_MESSAGES[status] ?? '';
}

export function getStatusPhase(status: string): PipelinePhase {
  return CLIENT_STATUS_PHASE[status as ClientStatus] ?? 'registration';
}

export function getStatusStyle(status: string): string {
  const override = CLIENT_STATUS_STYLE_OVERRIDE[status as ClientStatus];
  if (override) return override;
  const phase = getStatusPhase(status);
  return PIPELINE_PHASE_STYLE[phase];
}

export function isActionRequired(status: string): boolean {
  return ACTION_REQUIRED_STATUSES.includes(status as ClientStatus);
}

export const DOCUMENT_CATEGORY_LABELS: Record<string, string> = {
  base: 'Documentos Base',
  segment: 'Documentos do Segmento',
  product: 'Documentos do Produto',
  guarantee: 'Documentos de Garantia',
  conditional: 'Documentos Condicionais',
  partner: 'Documentos dos Sócios',
};
