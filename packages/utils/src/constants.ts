export const EMPLOYMENT_TYPES = ['clt', 'pj'] as const;

export const REIMBURSEMENT_CATEGORIES = [
  'transport',
  'meals',
  'accommodation',
  'supplies',
  'training',
  'health',
  'other',
] as const;

export const REIMBURSEMENT_STATUSES = [
  'draft',
  'pending',
  'approved',
  'rejected',
  'processing',
  'paid',
  'cancelled',
] as const;

export type ReimbursementStatus = (typeof REIMBURSEMENT_STATUSES)[number];

export const MOVEMENT_TYPES = [
  'hiring',
  'promotion',
  'merit_increase',
  'adjustment',
  'role_change',
  'transfer',
  'termination',
] as const;

export const PJ_INVOICE_STATUSES = [
  'pending_upload',
  'pending_review',
  'approved',
  'rejected',
  'pending_approval',
  'payment_scheduled',
  'paid',
  'overdue',
] as const;

export type PjInvoiceStatus = (typeof PJ_INVOICE_STATUSES)[number];

export const DEPENDENT_RELATIONSHIPS = [
  'spouse',
  'child',
  'parent',
  'other',
] as const;

export const PJ_INVOICE_STATUS_LABELS: Record<string, string> = {
  pending_upload: 'Pendente de envio',
  pending_review: 'Aguardando conferência',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
  pending_approval: 'Aguardando assinatura',
  payment_scheduled: 'Pagamento agendado',
  paid: 'Paga',
  overdue: 'Atrasada',
};

export const REIMBURSEMENT_STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  pending: 'Aguardando aprovação',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  processing: 'Em processamento',
  paid: 'Pago',
  cancelled: 'Cancelado',
};

export const REIMBURSEMENT_CATEGORY_LABELS: Record<string, string> = {
  transport: 'Transporte',
  meals: 'Alimentação',
  accommodation: 'Hospedagem',
  supplies: 'Materiais',
  training: 'Treinamento',
  health: 'Saúde',
  other: 'Outros',
};

export const DOCUMENT_TYPES = [
  'rg',
  'cpf',
  'ctps',
  'voter_registration',
  'military_cert',
  'marriage_certificate',
  'birth_certificate',
  'address_proof',
  'cnpj_card',
  'rni',
  'service_contract',
  'contract_amendment',
  'offer_letter',
  'termination_letter',
  'medical_exam_admission',
  'medical_exam_periodic',
  'medical_exam_termination',
  'photo',
  'other',
] as const;
