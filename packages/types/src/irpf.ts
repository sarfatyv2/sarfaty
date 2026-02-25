export const IRPF_DOCUMENT_SUBTYPES = ['receipt', 'declaration'] as const;
export type IrpfDocumentSubtype = (typeof IRPF_DOCUMENT_SUBTYPES)[number];

export const IRPF_EXTRACTION_STATUSES = [
  'pending',
  'processing',
  'completed',
  'failed',
  'needs_review',
] as const;
export type IrpfExtractionStatus = (typeof IRPF_EXTRACTION_STATUSES)[number];

export const IRPF_CONFIDENCE_LEVELS = ['high', 'medium', 'low'] as const;
export type IrpfConfidenceLevel = (typeof IRPF_CONFIDENCE_LEVELS)[number];

export const IRPF_REQUIRED_YEARS = [2024, 2025] as const;
export type IrpfRequiredYear = (typeof IRPF_REQUIRED_YEARS)[number];

export const IRPF_DECLARATION_TYPES = ['original', 'rectifying'] as const;
export type IrpfDeclarationType = (typeof IRPF_DECLARATION_TYPES)[number];

export const IRPF_TAXATION_OPTIONS = ['deductions', 'simplified'] as const;
export type IrpfTaxationOption = (typeof IRPF_TAXATION_OPTIONS)[number];

export interface IrpfDependent {
  name: string;
  cpf: string | null;
  birthDate: string | null;
  relationship: string;
}

export interface IrpfIncomeItem {
  sourceName: string;
  sourceCnpj: string;
  grossIncome: number;
  taxWithheld: number;
  socialSecurity: number | null;
  thirteenthSalary: number | null;
}

export interface IrpfExemptIncomeItem {
  code: string;
  description: string;
  beneficiaryName: string | null;
  beneficiaryCpfCnpj: string | null;
  amount: number;
}

export interface IrpfExclusiveIncomeItem {
  code: string;
  description: string;
  beneficiaryName: string | null;
  beneficiaryCpfCnpj: string | null;
  amount: number;
}

export interface IrpfPayment {
  code: string;
  description: string;
  beneficiaryName: string | null;
  beneficiaryCpfCnpj: string | null;
  amount: number;
  refundAmount: number | null;
}

export interface IrpfAsset {
  groupCode: string;
  itemCode: string;
  description: string;
  situation: string | null;
  valuePreviousYear: number;
  valueCurrentYear: number;
}

export interface IrpfDebt {
  code: string;
  description: string;
  creditorName: string | null;
  creditorCpfCnpj: string | null;
  valuePreviousYear: number;
  valueCurrentYear: number;
}

export interface IrpfConflict {
  field: string;
  receiptValue: unknown;
  declarationValue: unknown;
  resolvedValue: unknown;
  resolvedSource: IrpfDocumentSubtype;
  needsReview: boolean;
}

export interface IrpfFieldEvidence {
  field: string;
  value: unknown;
  source: IrpfDocumentSubtype;
  confidence: IrpfConfidenceLevel;
  page: number | null;
  lineSnippet: string | null;
}

export interface IrpfExtractionSummary {
  id: string;
  clientId: string;
  cpf: string;
  fullName: string | null;
  exerciseYear: number;
  calendarYear: number;
  extractionStatus: IrpfExtractionStatus;
  extractionConfidence: IrpfConfidenceLevel | null;
  totalTaxableIncome: string | null;
  taxDue: string | null;
  taxRefund: string | null;
  taxBalance: string | null;
  totalAssetsCurrentYear: string | null;
  needsReview: boolean;
  createdAt: string;
  updatedAt: string;
}
