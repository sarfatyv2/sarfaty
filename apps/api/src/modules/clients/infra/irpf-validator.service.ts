import { Injectable, Logger } from '@nestjs/common';
import { irpfRawExtractionSchema, type IrpfRawExtraction } from '@nexus/validators';
import type { IrpfConfidenceLevel } from '@nexus/types';

export interface IrpfValidationResult {
  data: IrpfRawExtraction;
  confidence: IrpfConfidenceLevel;
  warnings: string[];
  isValid: boolean;
}

const CURRENCY_TOLERANCE = 1;

@Injectable()
export class IrpfValidatorService {
  private readonly logger = new Logger(IrpfValidatorService.name);

  validate(raw: unknown): IrpfValidationResult {
    const parsed = irpfRawExtractionSchema.safeParse(raw);

    if (!parsed.success) {
      this.logger.warn('IRPF raw extraction failed schema validation', {
        issues: parsed.error.issues,
      });
      return {
        data: raw as IrpfRawExtraction,
        confidence: 'low',
        warnings: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
        isValid: false,
      };
    }

    const data = parsed.data;
    const warnings: string[] = [];

    if (data.cpf?.length !== 11) {
      warnings.push('cpf_missing_or_invalid');
    }

    if (data.exerciseYear !== null && data.calendarYear !== null) {
      if (data.exerciseYear !== data.calendarYear + 1) {
        warnings.push('exercise_calendar_year_mismatch');
      }
    }

    this.validateFinancialConsistency(data, warnings);

    const confidence = this.resolveConfidence(data.confidence ?? 'low', warnings);

    return { data, confidence, warnings, isValid: true };
  }

  private validateFinancialConsistency(data: IrpfRawExtraction, warnings: string[]): void {
    this.checkTaxableBase(data, warnings);
    this.checkTaxBalance(data, warnings);
    this.checkRefundAndBalance(data, warnings);
  }

  private checkTaxableBase(data: IrpfRawExtraction, warnings: string[]): void {
    if (data.totalTaxableIncome === null || data.totalDeductions === null || data.taxableBase === null) return;

    const expected = data.totalTaxableIncome - data.totalDeductions;
    const diff = Math.abs(expected - data.taxableBase);
    if (diff > CURRENCY_TOLERANCE) {
      warnings.push(`taxable_base_mismatch: expected ${expected.toFixed(2)}, got ${data.taxableBase}`);
    }
  }

  private checkTaxBalance(data: IrpfRawExtraction, warnings: string[]): void {
    if (data.taxDue === null || data.taxPaid === null || data.taxBalance === null) return;

    const expected = data.taxDue - data.taxPaid;
    const diff = Math.abs(expected - data.taxBalance);
    if (diff > CURRENCY_TOLERANCE) {
      warnings.push(`tax_balance_mismatch: expected ${expected.toFixed(2)}, got ${data.taxBalance}`);
    }
  }

  private checkRefundAndBalance(data: IrpfRawExtraction, warnings: string[]): void {
    if (data.taxRefund !== null && data.taxBalance !== null && data.taxRefund > 0 && data.taxBalance > 0) {
      warnings.push('tax_refund_and_balance_both_positive');
    }
  }

  private resolveConfidence(geminiConfidence: IrpfConfidenceLevel, warnings: string[]): IrpfConfidenceLevel {
    const hasBusinessWarnings = warnings.some((w) => w.includes('mismatch') || w.includes('missing'));
    if (geminiConfidence === 'high' && !hasBusinessWarnings) return 'high';
    if (geminiConfidence === 'low' || warnings.length > 2) return 'low';
    return 'medium';
  }
}
