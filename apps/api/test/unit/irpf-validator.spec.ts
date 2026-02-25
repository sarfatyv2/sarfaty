import { describe, it, expect } from 'vitest';
import { IrpfValidatorService } from '../../src/modules/clients/infra/irpf-validator.service';

function makeValidRaw(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    cpf: '12345678901',
    fullName: 'João Silva',
    exerciseYear: 2025,
    calendarYear: 2024,
    declarationType: 'original',
    taxationOption: 'deductions',
    receiptNumber: 'REC-001',
    deliveryTimestamp: null,
    birthDate: '1980-01-01',
    occupation: 'Empresário',
    occupationCode: '1234',
    nationality: 'Brasileiro',
    naturality: 'São Paulo',
    phone: '11999999999',
    email: 'joao@example.com',
    addressStreet: 'Rua A',
    addressNumber: '1',
    addressComplement: null,
    addressNeighborhood: 'Centro',
    addressCity: 'São Paulo',
    addressState: 'SP',
    addressZip: '01001001',
    spouseName: null,
    spouseCpf: null,
    totalTaxableIncome: 100000,
    totalExemptIncome: 5000,
    totalExclusiveIncome: 2000,
    totalDeductions: 20000,
    taxableBase: 80000,
    taxDue: 10000,
    taxPaid: 10000,
    taxRefund: 0,
    taxBalance: 0,
    totalAssetsCurrentYear: 500000,
    totalAssetsPreviousYear: 450000,
    totalDebtsCurrentYear: 50000,
    totalDebtsPreviousYear: 60000,
    dependents: [],
    taxableIncomeItems: [],
    exemptIncomeItems: [],
    exclusiveIncomeItems: [],
    payments: [],
    assets: [],
    debts: [],
    confidence: 'high',
    evidence: [],
    ...overrides,
  };
}

describe('IrpfValidatorService', () => {
  const service = new IrpfValidatorService();

  describe('schema validation', () => {
    it('returns isValid: false and confidence: low when schema is invalid', () => {
      const result = service.validate({ cpf: 123, exerciseYear: 'wrong' });
      expect(result.isValid).toBe(false);
      expect(result.confidence).toBe('low');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('returns isValid: true for a fully valid extraction', () => {
      const result = service.validate(makeValidRaw());
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('CPF validation', () => {
    it('adds cpf_missing_or_invalid when cpf is null', () => {
      const result = service.validate(makeValidRaw({ cpf: null }));
      expect(result.warnings).toContain('cpf_missing_or_invalid');
    });

    it('does not warn when cpf has exactly 11 digits', () => {
      const result = service.validate(makeValidRaw({ cpf: '12345678901' }));
      expect(result.warnings).not.toContain('cpf_missing_or_invalid');
    });
  });

  describe('year consistency', () => {
    it('adds exercise_calendar_year_mismatch when exerciseYear !== calendarYear + 1', () => {
      const result = service.validate(makeValidRaw({ exerciseYear: 2025, calendarYear: 2023 }));
      expect(result.warnings).toContain('exercise_calendar_year_mismatch');
    });

    it('does not warn when exerciseYear === calendarYear + 1', () => {
      const result = service.validate(makeValidRaw({ exerciseYear: 2025, calendarYear: 2024 }));
      expect(result.warnings).not.toContain('exercise_calendar_year_mismatch');
    });

    it('skips year check when either year is null', () => {
      const result = service.validate(makeValidRaw({ exerciseYear: null, calendarYear: null }));
      expect(result.warnings).not.toContain('exercise_calendar_year_mismatch');
    });
  });

  describe('taxable base consistency', () => {
    it('adds taxable_base_mismatch when diff > 1', () => {
      // expected = 100000 - 20000 = 80000, got 79000 (diff = 1000)
      const result = service.validate(makeValidRaw({ totalTaxableIncome: 100000, totalDeductions: 20000, taxableBase: 79000 }));
      expect(result.warnings.some((w) => w.startsWith('taxable_base_mismatch'))).toBe(true);
    });

    it('does not warn when diff <= 1', () => {
      // expected = 80000, got 80000.5 (diff = 0.5)
      const result = service.validate(makeValidRaw({ totalTaxableIncome: 100000, totalDeductions: 20000, taxableBase: 80000.5 }));
      expect(result.warnings.some((w) => w.startsWith('taxable_base_mismatch'))).toBe(false);
    });

    it('skips check when any of the three fields is null', () => {
      const result = service.validate(makeValidRaw({ taxableBase: null }));
      expect(result.warnings.some((w) => w.startsWith('taxable_base_mismatch'))).toBe(false);
    });
  });

  describe('tax balance consistency', () => {
    it('adds tax_balance_mismatch when diff > 1', () => {
      // expected = 10000 - 10000 = 0, got 500 (diff = 500)
      const result = service.validate(makeValidRaw({ taxDue: 10000, taxPaid: 10000, taxBalance: 500 }));
      expect(result.warnings.some((w) => w.startsWith('tax_balance_mismatch'))).toBe(true);
    });

    it('does not warn when balance is consistent', () => {
      const result = service.validate(makeValidRaw({ taxDue: 10000, taxPaid: 8000, taxBalance: 2000 }));
      expect(result.warnings.some((w) => w.startsWith('tax_balance_mismatch'))).toBe(false);
    });
  });

  describe('refund and balance both positive', () => {
    it('adds warning when both taxRefund and taxBalance are positive', () => {
      const result = service.validate(makeValidRaw({ taxRefund: 500, taxBalance: 300 }));
      expect(result.warnings).toContain('tax_refund_and_balance_both_positive');
    });

    it('does not warn when taxRefund is zero', () => {
      const result = service.validate(makeValidRaw({ taxRefund: 0, taxBalance: 300 }));
      expect(result.warnings).not.toContain('tax_refund_and_balance_both_positive');
    });
  });

  describe('confidence resolution', () => {
    it('returns high confidence when gemini says high and no business warnings', () => {
      const result = service.validate(makeValidRaw({ confidence: 'high' }));
      expect(result.confidence).toBe('high');
    });

    it('returns medium confidence when gemini says high but there are business warnings', () => {
      const result = service.validate(makeValidRaw({ confidence: 'high', taxableBase: 79000 }));
      expect(result.confidence).toBe('medium');
    });

    it('returns low confidence when gemini says low', () => {
      const result = service.validate(makeValidRaw({ confidence: 'low' }));
      expect(result.confidence).toBe('low');
    });

    it('returns low confidence when there are more than 2 warnings', () => {
      const result = service.validate(makeValidRaw({
        confidence: 'medium',
        cpf: null,
        exerciseYear: 2025,
        calendarYear: 2023,
        taxableBase: 1,
      }));
      expect(result.confidence).toBe('low');
    });
  });
});
