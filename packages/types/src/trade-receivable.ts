// ---------------------------------------------------------------------------
// Trade Receivable (Duplicata) Types
// ---------------------------------------------------------------------------

export const TRADE_RECEIVABLE_STATUSES = [
  'pending',
  'registered',
  'paid',
  'overdue',
  'protested',
  'cancelled',
  'written_off',
] as const;
export type TradeReceivableStatus = (typeof TRADE_RECEIVABLE_STATUSES)[number];

export const DOCUMENT_TYPES = [
  'duplicate',
  'promissory_note',
  'nfe',
  'check',
  'receipt',
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const SPECIES_CODE_MAP: Record<string, DocumentType> = {
  '01': 'duplicate',
  '02': 'promissory_note',
  '03': 'nfe',
  '04': 'duplicate',
  '05': 'receipt',
  '12': 'duplicate',
  '31': 'check',
  '99': 'duplicate',
};

export interface TradeReceivable {
  id: string;
  clientId: string;
  draweeId: string | null;
  cnabFileId: string;
  documentNumber: string | null;
  ourNumber: string | null;
  documentType: string | null;
  speciesCode: string | null;
  issueDate: string | null;
  dueDate: string | null;
  faceValue: string | null;
  interestPerDay: string | null;
  discountValue: string | null;
  discountDeadline: string | null;
  penaltyValue: string | null;
  iofValue: string | null;
  acceptance: string | null;
  instruction1: string | null;
  instruction2: string | null;
  draweeDocType: string | null;
  draweeDoc: string | null;
  draweeName: string | null;
  draweeAddress: string | null;
  draweeNeighborhood: string | null;
  draweeZip: string | null;
  draweeCity: string | null;
  draweeState: string | null;
  draweeEmail: string | null;
  bankCode: string | null;
  branch: string | null;
  portfolioCode: string | null;
  status: TradeReceivableStatus;
  operationId: string | null;
  evaluationStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason: string | null;
  portfolioPositionId: string | null;
  cnabRecordSequence: number | null;
  rawLine: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

// ---------------------------------------------------------------------------
// Client-Drawee Junction
// ---------------------------------------------------------------------------

export const CLIENT_DRAWEE_STATUSES = [
  'active',
  'inactive',
  'blocked',
] as const;
export type ClientDraweeStatus = (typeof CLIENT_DRAWEE_STATUSES)[number];

export interface ClientDrawee {
  id: string;
  clientId: string;
  draweeId: string;
  status: ClientDraweeStatus;
  totalTitles: number;
  totalExposure: string;
  firstOperationAt: string | null;
  lastOperationAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
