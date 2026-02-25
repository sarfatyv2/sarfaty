import { Injectable, Logger } from '@nestjs/common';
import type { FaturamentoRawExtraction } from '@nexus/validators';
import type { FaturamentoConfidenceLevel } from '@nexus/types';

export interface FaturamentoValidationResult {
  data: FaturamentoRawExtraction;
  isValid: boolean;
  warnings: string[];
  confidence: FaturamentoConfidenceLevel;
}

// 1% tolerance: small enough to catch real errors, large enough to absorb rounding
// across many months in large-revenue documents (e.g. R$200M/month).
const TOTAL_MISMATCH_TOLERANCE_PCT = 0.01;

// For the current calendar year, only months up to the current month are expected.
function expectedMonthCount(year: number): number {
  const now = new Date();
  if (year === now.getFullYear()) {
    return now.getMonth(); // 0-indexed: Jan=0 → "months past" = current month index
  }
  return 12;
}

@Injectable()
export class FaturamentoValidatorService {
  private readonly logger = new Logger(FaturamentoValidatorService.name);

  validate(raw: FaturamentoRawExtraction): FaturamentoValidationResult {
    const warnings: string[] = [];

    this.validateIdentification(raw, warnings);
    this.validateYear(raw, warnings);
    this.validateMonthlyRevenues(raw, warnings);

    const confidence = this.resolveConfidence(raw, warnings);
    const isValid = (raw.cnpj ?? raw.cpf) ? warnings.length <= 2 : false;

    if (warnings.length > 0) {
      this.logger.warn('Faturamento validation warnings', { warnings });
    }

    return { data: raw, isValid, warnings, confidence };
  }

  private validateIdentification(raw: FaturamentoRawExtraction, warnings: string[]): void {
    if (raw.cnpj ?? raw.cpf) return;
    warnings.push('Neither CNPJ nor CPF could be identified in the document');
  }

  private validateYear(raw: FaturamentoRawExtraction, warnings: string[]): void {
    if (raw.year) {
      const currentYear = new Date().getFullYear();
      if (raw.year < 2015 || raw.year > currentYear) {
        warnings.push(`Year ${raw.year} is outside the expected range (2015–${currentYear})`);
      }
      return;
    }
    warnings.push('Reference year could not be identified');
  }

  private validateMonthlyRevenues(raw: FaturamentoRawExtraction, warnings: string[]): void {
    if (raw.monthlyRevenues) {
      this.checkMonthCoverage(raw, warnings);
      this.checkTotalConsistency(raw, warnings);
      return;
    }
    warnings.push('No monthly revenue data found in the document');
  }

  private checkMonthCoverage(raw: FaturamentoRawExtraction, warnings: string[]): void {
    const revenues = raw.monthlyRevenues!;
    const presentMonths = Object.values(revenues).filter((v) => v !== null).length;

    if (presentMonths === 0) {
      warnings.push('All monthly revenue values are null');
      return;
    }

    const expected = raw.year ? expectedMonthCount(raw.year) : 12;
    const threshold = Math.min(6, expected);
    if (expected > 0 && presentMonths < threshold) {
      warnings.push(`Only ${presentMonths} out of ${expected} expected months have revenue data`);
    }
  }

  private checkTotalConsistency(raw: FaturamentoRawExtraction, warnings: string[]): void {
    const documentTotal = raw.totalAnnualRevenue;
    if (documentTotal === null || documentTotal <= 0) return;

    const computedTotal = Object.values(raw.monthlyRevenues!)
      .filter((v): v is number => v !== null)
      .reduce((sum, v) => sum + v, 0);

    if (computedTotal <= 0) return;

    const tolerance = documentTotal * TOTAL_MISMATCH_TOLERANCE_PCT;
    const diff = Math.abs(computedTotal - documentTotal);
    if (diff > tolerance) {
      const diffPct = ((diff / documentTotal) * 100).toFixed(1);
      warnings.push(
        `Total mismatch: computed R$ ${computedTotal.toFixed(2)} vs document R$ ${documentTotal.toFixed(2)} (${diffPct}% difference)`,
      );
    }
  }

  private resolveConfidence(
    raw: FaturamentoRawExtraction,
    warnings: string[],
  ): FaturamentoConfidenceLevel {
    if (raw.confidence === 'low' || (!raw.cnpj && !raw.cpf) || !raw.year) {
      return 'low';
    }
    if (raw.confidence === 'high' && warnings.length === 0) {
      return 'high';
    }
    return 'medium';
  }
}
