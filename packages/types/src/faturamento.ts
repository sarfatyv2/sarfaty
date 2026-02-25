export const FATURAMENTO_EXTRACTION_STATUSES = [
  'pending',
  'processing',
  'completed',
  'failed',
  'needs_review',
] as const;
export type FaturamentoExtractionStatus = (typeof FATURAMENTO_EXTRACTION_STATUSES)[number];

export const FATURAMENTO_CONFIDENCE_LEVELS = ['high', 'medium', 'low'] as const;
export type FaturamentoConfidenceLevel = (typeof FATURAMENTO_CONFIDENCE_LEVELS)[number];

export interface FaturamentoMonthlyRevenues {
  jan: number | null;
  feb: number | null;
  mar: number | null;
  apr: number | null;
  may: number | null;
  jun: number | null;
  jul: number | null;
  aug: number | null;
  sep: number | null;
  oct: number | null;
  nov: number | null;
  dec: number | null;
}

export interface FaturamentoExtractionSummary {
  id: string;
  clientId: string;
  cnpj: string;
  cpf: string | null;
  companyName: string | null;
  year: number;
  monthlyRevenues: FaturamentoMonthlyRevenues | null;
  totalAnnualRevenue: string | null;
  documentDescription: string | null;
  extractionStatus: FaturamentoExtractionStatus;
  extractionConfidence: FaturamentoConfidenceLevel | null;
  needsReview: boolean;
  createdAt: string;
  updatedAt: string;
}
