// ---------------------------------------------------------------------------
// CNAB Operation Types
// ---------------------------------------------------------------------------

export const CNAB_OPERATION_STATUSES = [
  'draft',
  'under_evaluation',
  'evaluated',
  'active',
] as const;
export type CnabOperationStatus = (typeof CNAB_OPERATION_STATUSES)[number];

export const EVALUATION_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type EvaluationStatus = (typeof EVALUATION_STATUSES)[number];

export interface CnabOperation {
  id: string;
  clientId: string;
  cnabFileId: string;
  status: CnabOperationStatus;
  totalSubmittedAmount: string;
  totalApprovedAmount: string;
  createdAt: string | null;
  updatedAt: string | null;
}
