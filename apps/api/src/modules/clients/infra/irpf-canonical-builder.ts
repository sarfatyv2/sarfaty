import type { IrpfRawExtraction } from '@nexus/validators';
import type { IrpfExtractionProps } from '../domain/irpf-extraction.entity';
import type { IrpfValidationResult } from './irpf-validator.service';
import type { IrpfUnifyInput } from './irpf-unifier.service';

type CanonicalData = Omit<IrpfExtractionProps, 'id' | 'createdAt' | 'updatedAt'>;

function toDecimalString(value: number | null): string | null {
  if (value === null) return null;
  return String(value);
}

/**
 * Builds a new canonical IRPF record from scratch (first document received).
 */
export function buildInitialCanonical(
  input: IrpfUnifyInput,
  data: IrpfRawExtraction,
  validationResult: IrpfValidationResult,
): CanonicalData {
  return {
    clientId: input.clientId,
    authorizedPersonId: input.authorizedPersonId,
    cpf: data.cpf ?? '',
    exerciseYear: data.exerciseYear ?? input.referenceYear ?? 0,
    calendarYear: data.calendarYear ?? (input.referenceYear ? input.referenceYear - 1 : 0),
    fullName: data.fullName,
    birthDate: data.birthDate,
    occupation: data.occupation,
    occupationCode: data.occupationCode,
    nationality: data.nationality,
    naturality: data.naturality,
    phone: data.phone,
    email: data.email,
    addressStreet: data.addressStreet,
    addressNumber: data.addressNumber,
    addressComplement: data.addressComplement,
    addressNeighborhood: data.addressNeighborhood,
    addressCity: data.addressCity,
    addressState: data.addressState,
    addressZip: data.addressZip,
    spouseName: data.spouseName,
    spouseCpf: data.spouseCpf,
    declarationType: data.declarationType,
    taxationOption: data.taxationOption,
    receiptNumber: data.receiptNumber,
    deliveryTimestamp: data.deliveryTimestamp ? new Date(data.deliveryTimestamp) : null,
    totalTaxableIncome: toDecimalString(data.totalTaxableIncome),
    totalExemptIncome: toDecimalString(data.totalExemptIncome),
    totalExclusiveIncome: toDecimalString(data.totalExclusiveIncome),
    totalDeductions: toDecimalString(data.totalDeductions),
    taxableBase: toDecimalString(data.taxableBase),
    taxDue: toDecimalString(data.taxDue),
    taxPaid: toDecimalString(data.taxPaid),
    taxRefund: toDecimalString(data.taxRefund),
    taxBalance: toDecimalString(data.taxBalance),
    totalAssetsCurrentYear: toDecimalString(data.totalAssetsCurrentYear),
    totalAssetsPreviousYear: toDecimalString(data.totalAssetsPreviousYear),
    totalDebtsCurrentYear: toDecimalString(data.totalDebtsCurrentYear),
    totalDebtsPreviousYear: toDecimalString(data.totalDebtsPreviousYear),
    dependents: data.dependents,
    taxableIncomeItems: data.taxableIncomeItems,
    exemptIncomeItems: data.exemptIncomeItems,
    exclusiveIncomeItems: data.exclusiveIncomeItems,
    payments: data.payments,
    assets: data.assets,
    debts: data.debts,
    extractionStatus: validationResult.isValid ? 'completed' : 'needs_review',
    extractionConfidence: validationResult.confidence,
    ocrApplied: !input.classification.hasNativeText,
    needsReview: !validationResult.isValid || validationResult.warnings.length > 0,
    conflicts: null,
    extractionLog: {
      warnings: validationResult.warnings,
      documentSubtype: input.classification.type,
    },
  };
}
