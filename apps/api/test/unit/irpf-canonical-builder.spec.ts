import { describe, it, expect } from 'vitest';
import { buildInitialCanonical } from '../../src/modules/clients/infra/irpf-canonical-builder';
import type { IrpfUnifyInput } from '../../src/modules/clients/infra/irpf-unifier.service';
import type { IrpfValidationResult } from '../../src/modules/clients/infra/irpf-validator.service';
import type { IrpfRawExtraction } from '@nexus/validators';

function makeInput(overrides: Partial<IrpfUnifyInput> = {}): IrpfUnifyInput {
  return {
    clientId: 'client-001',
    authorizedPersonId: 'person-001',
    documentId: 'doc-001',
    partnerName: 'João Silva',
    referenceYear: 2025,
    classification: { type: 'declaration', label: 'Declaração', hasNativeText: true },
    validationResult: makeValidationResult(),
    ...overrides,
  };
}

function makeData(overrides: Partial<IrpfRawExtraction> = {}): IrpfRawExtraction {
  return {
    cpf: '12345678901',
    fullName: 'João Silva',
    exerciseYear: 2025,
    calendarYear: 2024,
    declarationType: 'original',
    taxationOption: 'deductions',
    receiptNumber: null,
    deliveryTimestamp: null,
    birthDate: '1980-05-15',
    occupation: 'Empresário',
    occupationCode: '1234',
    nationality: 'Brasileiro',
    naturality: 'São Paulo',
    phone: '11999999999',
    email: 'joao@example.com',
    addressStreet: 'Rua A',
    addressNumber: '100',
    addressComplement: null,
    addressNeighborhood: 'Centro',
    addressCity: 'São Paulo',
    addressState: 'SP',
    addressZip: '01001001',
    spouseName: null,
    spouseCpf: null,
    totalTaxableIncome: 120000.5,
    totalExemptIncome: 5000,
    totalExclusiveIncome: null,
    totalDeductions: 20000,
    taxableBase: 100000.5,
    taxDue: 15000,
    taxPaid: 15000,
    taxRefund: null,
    taxBalance: 0,
    totalAssetsCurrentYear: 600000,
    totalAssetsPreviousYear: null,
    totalDebtsCurrentYear: 50000,
    totalDebtsPreviousYear: 55000,
    dependents: [{ name: 'Maria', cpf: '98765432100', birthDate: '2010-03-20', relationship: 'Filha' }],
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

function makeValidationResult(overrides: Partial<IrpfValidationResult> = {}): IrpfValidationResult {
  return {
    data: makeData(),
    confidence: 'high',
    warnings: [],
    isValid: true,
    ...overrides,
  };
}

describe('buildInitialCanonical()', () => {
  it('maps scalar identification fields correctly', () => {
    const data = makeData();
    const result = buildInitialCanonical(makeInput(), data, makeValidationResult({ data }));

    expect(result.clientId).toBe('client-001');
    expect(result.authorizedPersonId).toBe('person-001');
    expect(result.cpf).toBe('12345678901');
    expect(result.fullName).toBe('João Silva');
    expect(result.exerciseYear).toBe(2025);
    expect(result.calendarYear).toBe(2024);
    expect(result.addressState).toBe('SP');
  });

  it('converts numeric financial fields to decimal strings', () => {
    const data = makeData();
    const result = buildInitialCanonical(makeInput(), data, makeValidationResult({ data }));

    expect(result.totalTaxableIncome).toBe('120000.5');
    expect(result.totalDeductions).toBe('20000');
    expect(result.taxableBase).toBe('100000.5');
    expect(result.taxDue).toBe('15000');
  });

  it('converts null financial fields to null strings', () => {
    const data = makeData({ totalExclusiveIncome: null, taxRefund: null, totalAssetsPreviousYear: null });
    const result = buildInitialCanonical(makeInput(), data, makeValidationResult({ data }));

    expect(result.totalExclusiveIncome).toBeNull();
    expect(result.taxRefund).toBeNull();
    expect(result.totalAssetsPreviousYear).toBeNull();
  });

  it('converts deliveryTimestamp string to Date', () => {
    const data = makeData({ deliveryTimestamp: '2025-04-30T22:59:00-03:00' });
    const result = buildInitialCanonical(makeInput(), data, makeValidationResult({ data }));

    expect(result.deliveryTimestamp).toBeInstanceOf(Date);
  });

  it('keeps deliveryTimestamp as null when not present', () => {
    const data = makeData({ deliveryTimestamp: null });
    const result = buildInitialCanonical(makeInput(), data, makeValidationResult({ data }));

    expect(result.deliveryTimestamp).toBeNull();
  });

  it('falls back to input.referenceYear when exerciseYear is null', () => {
    const data = makeData({ exerciseYear: null, calendarYear: null });
    const result = buildInitialCanonical(
      makeInput({ referenceYear: 2025 }),
      data,
      makeValidationResult({ data }),
    );

    expect(result.exerciseYear).toBe(2025);
    expect(result.calendarYear).toBe(2024);
  });

  it('uses 0 when both exerciseYear and referenceYear are null', () => {
    const data = makeData({ exerciseYear: null, calendarYear: null });
    const result = buildInitialCanonical(
      makeInput({ referenceYear: null }),
      data,
      makeValidationResult({ data }),
    );

    expect(result.exerciseYear).toBe(0);
  });

  it('sets ocrApplied: true when hasNativeText is false', () => {
    const result = buildInitialCanonical(
      makeInput({ classification: { type: 'receipt', label: 'Recibo', hasNativeText: false } }),
      makeData(),
      makeValidationResult(),
    );
    expect(result.ocrApplied).toBe(true);
  });

  it('sets ocrApplied: false when hasNativeText is true', () => {
    const result = buildInitialCanonical(makeInput(), makeData(), makeValidationResult());
    expect(result.ocrApplied).toBe(false);
  });

  it('sets needsReview: true when isValid is false', () => {
    const data = makeData();
    const result = buildInitialCanonical(
      makeInput(),
      data,
      makeValidationResult({ data, isValid: false }),
    );
    expect(result.needsReview).toBe(true);
    expect(result.extractionStatus).toBe('needs_review');
  });

  it('sets needsReview: true when there are warnings even if isValid is true', () => {
    const data = makeData();
    const result = buildInitialCanonical(
      makeInput(),
      data,
      makeValidationResult({ data, isValid: true, warnings: ['cpf_missing_or_invalid'] }),
    );
    expect(result.needsReview).toBe(true);
  });

  it('sets needsReview: false and status completed when valid and no warnings', () => {
    const result = buildInitialCanonical(makeInput(), makeData(), makeValidationResult());
    expect(result.needsReview).toBe(false);
    expect(result.extractionStatus).toBe('completed');
  });

  it('maps list fields (dependents) correctly', () => {
    const result = buildInitialCanonical(makeInput(), makeData(), makeValidationResult());
    expect(result.dependents).toHaveLength(1);
    expect((result.dependents as Array<{ name: string }>)[0].name).toBe('Maria');
  });

  it('stores warnings and document subtype in extractionLog', () => {
    const data = makeData();
    const result = buildInitialCanonical(
      makeInput(),
      data,
      makeValidationResult({ data, warnings: ['exercise_calendar_year_mismatch'] }),
    );
    const log = result.extractionLog as Record<string, unknown>;
    expect(log.warnings).toContain('exercise_calendar_year_mismatch');
    expect(log.documentSubtype).toBe('declaration');
  });
});
