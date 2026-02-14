export const CLIENT_STATUSES = [
  'draft',
  'pending_documents',
  'document_validation',
  'document_issues',
  'credit_analysis',
  'auto_rejected',
  'pending_report',
  'pending_approval',
  'approved',
  'rejected',
  'pending_partner_docs',
  'partner_doc_validation',
  'pending_homologation',
  'homologated',
  'homologation_issues',
  'active',
  'risk_management',
  'recovery',
  'litigation',
  'settled',
  'cancelled',
] as const;

export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const EDITABLE_STATUSES: ClientStatus[] = [
  'draft',
  'pending_documents',
  'document_issues',
];

export const DOCUMENT_CATEGORIES = [
  'base',
  'segment',
  'product',
  'guarantee',
  'conditional',
  'partner',
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export const VALIDATION_STATUSES = [
  'pending',
  'processing',
  'valid',
  'invalid',
  'needs_review',
] as const;

export type ValidationStatus = (typeof VALIDATION_STATUSES)[number];

export interface DocumentChecklistItem {
  documentType: string;
  documentLabel: string;
  description: string | null;
  category: DocumentCategory;
  isRequired: boolean;
  guaranteeId: string | null;
  status: 'missing' | 'uploaded' | 'validating' | 'valid' | 'invalid';
  documentId: string | null;
  fileName: string | null;
  validationStatus: string | null;
}

export interface CanSubmitResult {
  canSubmit: boolean;
  totalRequired: number;
  totalUploaded: number;
  missingDocuments: string[];
}

export const BASE_DOCUMENT_TYPES = [
  { type: 'revenue', label: 'Faturamento 2022, 2023, 2024 e 2025', description: 'Faturamento mês a mês por ano' },
  { type: 'debt_position', label: 'Endividamento Atual (assinado)', description: 'Aberto por instituição, saldo, modalidade, garantia, % e vencimento' },
  { type: 'balance_sheet_dre', label: 'Balanços e DRE 2023, 2024 e 2025', description: 'Balanço patrimonial + DRE de cada exercício' },
  { type: 'balance_trial_comparative', label: 'Balancete Comparativo', description: 'Mesmo período, ano atual vs anterior' },
  { type: 'irpf', label: 'IRPF dos Sócios (declaração + recibo) 2024, 2025', description: 'Declaração completa e recibo de entrega' },
  { type: 'corporate_docs', label: 'Documentação Societária', description: 'Ata, organograma, contrato social e alterações' },
  { type: 'partner_id', label: 'CNH ou RG dos Sócios', description: 'Documento de identificação com foto' },
  { type: 'partner_address_proof', label: 'Comprovante de Endereço dos Sócios', description: 'Comprovante recente (máx. 90 dias)' },
  { type: 'abc_curve', label: 'Curva ABC — Maiores Clientes e Fornecedores', description: 'Ranking por volume' },
  { type: 'visit_report', label: 'Proposta / Relatório de Visita', description: 'Incluindo meios circulantes atuais' },
  { type: 'superintendent_opinion', label: 'Parecer do Superintendente', description: 'Parecer assinado sobre a operação' },
] as const;

export const CONDITIONAL_DOCUMENT_TYPES = [
  { type: 'rj_plan', label: 'Plano de Recuperação Judicial Atual', description: 'Plano vigente aprovado pelo juízo' },
  { type: 'rj_creditors', label: 'Lista de Credores', description: 'Lista atualizada de credores da RJ' },
  { type: 'rj_balance', label: 'Saldo Atual da Recuperação Judicial', description: 'Posição atualizada dos pagamentos da RJ' },
] as const;
