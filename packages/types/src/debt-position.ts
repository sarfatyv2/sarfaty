export const DEBT_POSITION_SOURCES = ['ai', 'manual'] as const;
export type DebtPositionSource = (typeof DEBT_POSITION_SOURCES)[number];

export const DEBT_POSITION_CONFIDENCE_LEVELS = ['high', 'medium', 'low'] as const;
export type DebtPositionConfidenceLevel = (typeof DEBT_POSITION_CONFIDENCE_LEVELS)[number];

export interface DebtPositionItem {
  id: string;
  clientId: string;
  documentId: string | null;
  institution: string;
  modality: string | null;
  guarantee: string | null;
  guaranteePercentage: string | null;
  value: string;
  notes: string | null;
  source: DebtPositionSource;
  extractionConfidence: DebtPositionConfidenceLevel | null;
  isAiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}
