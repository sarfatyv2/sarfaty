import { Injectable } from '@nestjs/common';
import type { FaturamentoExtractionProps } from '../domain/faturamento-extraction.entity';
import type { FaturamentoMonthlyRevenues } from '@nexus/types';
import { buildInitialFaturamentoCanonical, type FaturamentoBuildInput } from './faturamento-canonical-builder';

type CanonicalData = Omit<FaturamentoExtractionProps, 'id' | 'createdAt' | 'updatedAt'>;

const MONTH_KEYS: (keyof FaturamentoMonthlyRevenues)[] = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
];

@Injectable()
export class FaturamentoUnifierService {
  buildCanonical(input: FaturamentoBuildInput, existing: FaturamentoExtractionProps | null): CanonicalData {
    if (!existing) {
      return buildInitialFaturamentoCanonical(input);
    }
    return this.mergeWithExisting(existing, input);
  }

  private mergeWithExisting(
    existing: FaturamentoExtractionProps,
    input: FaturamentoBuildInput,
  ): CanonicalData {
    const incoming = input.validationResult.data;

    const mergedMonthly = this.mergeMonthlyRevenues(
      existing.monthlyRevenues,
      (incoming.monthlyRevenues as FaturamentoMonthlyRevenues) ?? null,
    );

    const mergedTotal = this.resolveTotalRevenue(
      existing.totalAnnualRevenue,
      incoming.totalAnnualRevenue,
      mergedMonthly,
    );

    const needsReview = !input.validationResult.isValid || input.validationResult.confidence === 'low';
    const previousLog = (existing.extractionLog as Record<string, unknown>) ?? {};

    return {
      clientId: existing.clientId,
      cnpj: existing.cnpj,
      year: existing.year,
      cpf: existing.cpf ?? incoming.cpf ?? null,
      companyName: existing.companyName ?? incoming.companyName ?? null,
      monthlyRevenues: mergedMonthly,
      totalAnnualRevenue: mergedTotal,
      documentDescription: existing.documentDescription ?? incoming.documentDescription ?? null,
      extractionStatus: needsReview ? 'needs_review' : 'completed',
      extractionConfidence: input.validationResult.confidence,
      ocrApplied: existing.ocrApplied,
      needsReview,
      extractionLog: {
        ...previousLog,
        lastMerge: {
          documentId: input.documentId,
          warnings: input.validationResult.warnings,
        },
      },
    };
  }

  private mergeMonthlyRevenues(
    existing: FaturamentoMonthlyRevenues | null,
    incoming: FaturamentoMonthlyRevenues | null,
  ): FaturamentoMonthlyRevenues | null {
    if (!existing && !incoming) return null;
    if (!existing) return incoming;
    if (!incoming) return existing;

    const merged = { ...existing };
    for (const month of MONTH_KEYS) {
      if (merged[month] === null && incoming[month] !== null) {
        (merged[month] as number | null) = incoming[month];
      }
    }
    return merged;
  }

  private resolveTotalRevenue(
    existingTotal: string | null,
    incomingTotal: number | null,
    mergedMonthly: FaturamentoMonthlyRevenues | null,
  ): string | null {
    if (incomingTotal !== null) {
      return String(incomingTotal);
    }
    if (existingTotal !== null) {
      return existingTotal;
    }
    if (mergedMonthly) {
      const sum = Object.values(mergedMonthly)
        .filter((v): v is number => v !== null)
        .reduce((acc, v) => acc + v, 0);
      return sum > 0 ? String(sum) : null;
    }
    return null;
  }
}
