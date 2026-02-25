import type { FaturamentoExtractionProps } from '../domain/faturamento-extraction.entity';
import type { FaturamentoValidationResult } from './faturamento-validator.service';
import type { FaturamentoMonthlyRevenues } from '@nexus/types';

type CanonicalData = Omit<FaturamentoExtractionProps, 'id' | 'createdAt' | 'updatedAt'>;

export interface FaturamentoBuildInput {
  clientId: string;
  documentId: string;
  referenceYear: number | null;
  validationResult: FaturamentoValidationResult;
}

const PLACEHOLDER_CNPJ_PREFIX = 'doc:';

export function buildInitialFaturamentoCanonical(input: FaturamentoBuildInput): CanonicalData {
  const { validationResult, clientId, documentId, referenceYear } = input;
  const raw = validationResult.data;

  const cnpj = raw.cnpj ?? `${PLACEHOLDER_CNPJ_PREFIX}${documentId}`;
  const year = raw.year ?? referenceYear ?? new Date().getFullYear();

  const needsReview = validationResult.isValid === false || validationResult.confidence === 'low';

  return {
    clientId,
    cnpj,
    year,
    cpf: raw.cpf ?? null,
    companyName: raw.companyName ?? null,
    monthlyRevenues: (raw.monthlyRevenues as FaturamentoMonthlyRevenues) ?? null,
    totalAnnualRevenue: raw.totalAnnualRevenue !== null ? String(raw.totalAnnualRevenue) : null,
    documentDescription: raw.documentDescription ?? null,
    extractionStatus: needsReview ? 'needs_review' : 'completed',
    extractionConfidence: validationResult.confidence,
    ocrApplied: false,
    needsReview,
    extractionLog: {
      initial: {
        warnings: validationResult.warnings,
        documentId,
      },
    },
  };
}
