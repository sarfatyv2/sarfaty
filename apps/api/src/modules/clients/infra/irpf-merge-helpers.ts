import type { IrpfConflict } from '@nexus/types';
import type { IrpfRawExtraction } from '@nexus/validators';
import type { IrpfClassification } from './irpf-classifier.service';

type MergedRecord = Record<string, unknown>;

const IDENTIFICATION_FIELDS: (keyof IrpfRawExtraction)[] = [
  'fullName', 'birthDate', 'occupation', 'occupationCode', 'nationality',
  'naturality', 'phone', 'email', 'addressStreet', 'addressNumber',
  'addressComplement', 'addressNeighborhood', 'addressCity', 'addressState',
  'addressZip', 'spouseName', 'spouseCpf',
];

const FINANCIAL_FIELDS: (keyof IrpfRawExtraction)[] = [
  'totalTaxableIncome', 'totalExemptIncome', 'totalExclusiveIncome',
  'totalDeductions', 'taxableBase', 'taxDue', 'taxPaid', 'taxRefund', 'taxBalance',
  'totalAssetsCurrentYear', 'totalAssetsPreviousYear',
  'totalDebtsCurrentYear', 'totalDebtsPreviousYear',
];

const LIST_FIELDS: (keyof IrpfRawExtraction)[] = [
  'dependents', 'taxableIncomeItems', 'exemptIncomeItems',
  'exclusiveIncomeItems', 'payments', 'assets', 'debts',
];

const FINANCIAL_CONFLICT_THRESHOLD = 100;
const FINANCIAL_TOLERANCE = 1;

/**
 * Fills missing identification fields from incoming extraction.
 * Prefers declaration data (more complete); never overwrites existing values.
 */
export function mergeIdentificationFields(
  merged: MergedRecord,
  incoming: IrpfRawExtraction,
): void {
  for (const field of IDENTIFICATION_FIELDS) {
    const incomingValue = incoming[field];
    const existingValue = merged[field as string];
    const isMissing = incomingValue !== null && incomingValue !== undefined && !existingValue;
    if (isMissing) {
      merged[field as string] = incomingValue;
    }
  }
}

function mergeReceiptNumber(
  merged: MergedRecord,
  incoming: IrpfRawExtraction,
  isIncomingReceipt: boolean,
  conflicts: IrpfConflict[],
): void {
  if (!incoming.receiptNumber) return;

  const existing = merged.receiptNumber as string | null;
  if (existing && existing !== incoming.receiptNumber) {
    conflicts.push({
      field: 'receiptNumber',
      receiptValue: isIncomingReceipt ? incoming.receiptNumber : existing,
      declarationValue: isIncomingReceipt ? existing : incoming.receiptNumber,
      resolvedValue: isIncomingReceipt ? incoming.receiptNumber : existing,
      resolvedSource: 'receipt',
      needsReview: true,
    });
  }
  if (isIncomingReceipt || !existing) {
    merged.receiptNumber = incoming.receiptNumber;
  }
}

function mergeDeliveryTimestamp(
  merged: MergedRecord,
  incoming: IrpfRawExtraction,
  isIncomingReceipt: boolean,
): void {
  if (!incoming.deliveryTimestamp) return;

  const existing = merged.deliveryTimestamp as Date | null;
  if (isIncomingReceipt || !existing) {
    merged.deliveryTimestamp = new Date(incoming.deliveryTimestamp);
  }
}

/**
 * Merges protocol fields (receiptNumber, deliveryTimestamp).
 * Prefers receipt document as source of truth for these fields.
 * Records a conflict if values diverge.
 */
export function mergeProtocolFields(
  merged: MergedRecord,
  incoming: IrpfRawExtraction,
  isIncomingReceipt: boolean,
  conflicts: IrpfConflict[],
): void {
  mergeReceiptNumber(merged, incoming, isIncomingReceipt, conflicts);
  mergeDeliveryTimestamp(merged, incoming, isIncomingReceipt);
}

/**
 * Merges financial summary fields.
 * Fills nulls from incoming; records a conflict if values diverge above tolerance.
 * Prefers declaration as resolved source for financial data.
 */
export function mergeFinancialFields(
  merged: MergedRecord,
  incoming: IrpfRawExtraction,
  isIncomingReceipt: boolean,
  conflicts: IrpfConflict[],
): void {
  for (const field of FINANCIAL_FIELDS) {
    const incomingValue = incoming[field] as number | null;
    const existingValue = merged[field as string] as string | null;

    if (incomingValue === null) continue;

    if (!existingValue) {
      merged[field as string] = String(incomingValue);
      continue;
    }

    const existingNum = Number.parseFloat(existingValue);
    const diff = Math.abs(existingNum - incomingValue);
    if (diff > FINANCIAL_TOLERANCE) {
      conflicts.push({
        field: field as string,
        receiptValue: isIncomingReceipt ? incomingValue : existingNum,
        declarationValue: isIncomingReceipt ? existingNum : incomingValue,
        resolvedValue: existingNum,
        resolvedSource: 'declaration',
        needsReview: diff > FINANCIAL_CONFLICT_THRESHOLD,
      });
    }
  }
}

/**
 * Merges list fields (dependents, payments, assets, etc.).
 * Fills from incoming only when existing list is empty.
 */
export function mergeListFields(
  merged: MergedRecord,
  incoming: IrpfRawExtraction,
): void {
  for (const field of LIST_FIELDS) {
    const existingList = merged[field as string] as unknown[] | null;
    const incomingList = incoming[field] as unknown[];
    const isEmpty = !existingList || existingList.length === 0;
    if (incomingList.length > 0 && isEmpty) {
      merged[field as string] = incomingList;
    }
  }
}

/**
 * Runs the full merge pipeline and returns the updated merged record and conflict list.
 */
export function runMergePipeline(
  existing: MergedRecord,
  incoming: IrpfRawExtraction,
  classification: IrpfClassification,
  previousConflicts: IrpfConflict[],
): { merged: MergedRecord; conflicts: IrpfConflict[] } {
  const merged: MergedRecord = { ...existing };
  const conflicts: IrpfConflict[] = [...previousConflicts];
  const isIncomingReceipt = classification.type === 'receipt';

  mergeIdentificationFields(merged, incoming);
  mergeProtocolFields(merged, incoming, isIncomingReceipt, conflicts);
  mergeFinancialFields(merged, incoming, isIncomingReceipt, conflicts);
  mergeListFields(merged, incoming);

  return { merged, conflicts };
}
