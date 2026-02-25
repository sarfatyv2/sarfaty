import { describe, it, expect } from 'vitest';
import {
  mergeIdentificationFields,
  mergeProtocolFields,
  mergeFinancialFields,
  mergeListFields,
  runMergePipeline,
} from '../../src/modules/clients/infra/irpf-merge-helpers';
import type { IrpfRawExtraction } from '@nexus/validators';
import type { IrpfConflict } from '@nexus/types';

function makeIncoming(overrides: Partial<IrpfRawExtraction> = {}): IrpfRawExtraction {
  return {
    cpf: '12345678901',
    fullName: 'João Silva',
    exerciseYear: 2025,
    calendarYear: 2024,
    declarationType: 'original',
    taxationOption: 'deductions',
    receiptNumber: 'REC-001',
    deliveryTimestamp: '2025-04-30T22:59:00-03:00',
    birthDate: '1980-01-01',
    occupation: 'Empresário',
    occupationCode: '1234',
    nationality: 'Brasileiro',
    naturality: 'SP',
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
    totalExclusiveIncome: null,
    totalDeductions: 20000,
    taxableBase: 80000,
    taxDue: 10000,
    taxPaid: 10000,
    taxRefund: null,
    taxBalance: 0,
    totalAssetsCurrentYear: 500000,
    totalAssetsPreviousYear: null,
    totalDebtsCurrentYear: 50000,
    totalDebtsPreviousYear: null,
    dependents: [{ name: 'Maria', cpf: null, birthDate: null, relationship: 'Filha' }],
    taxableIncomeItems: [],
    exemptIncomeItems: [],
    exclusiveIncomeItems: [],
    payments: [],
    assets: [{ groupCode: '01', itemCode: '01', description: 'Imóvel', situation: null, valuePreviousYear: 0, valueCurrentYear: 300000 }],
    debts: [],
    confidence: 'high',
    evidence: [],
    ...overrides,
  };
}

describe('mergeIdentificationFields()', () => {
  it('fills a missing field from incoming', () => {
    const merged: Record<string, unknown> = { fullName: null };
    mergeIdentificationFields(merged, makeIncoming({ fullName: 'João Silva' }));
    expect(merged.fullName).toBe('João Silva');
  });

  it('does not overwrite an existing field', () => {
    const merged: Record<string, unknown> = { fullName: 'Existing Name' };
    mergeIdentificationFields(merged, makeIncoming({ fullName: 'João Silva' }));
    expect(merged.fullName).toBe('Existing Name');
  });

  it('does not fill when incoming value is null', () => {
    const merged: Record<string, unknown> = { email: null };
    mergeIdentificationFields(merged, makeIncoming({ email: null }));
    expect(merged.email).toBeNull();
  });

  it('fills multiple missing fields in one call', () => {
    const merged: Record<string, unknown> = { fullName: null, phone: null };
    mergeIdentificationFields(merged, makeIncoming());
    expect(merged.fullName).toBe('João Silva');
    expect(merged.phone).toBe('11999999999');
  });
});

describe('mergeProtocolFields()', () => {
  it('sets receiptNumber when existing is null', () => {
    const merged: Record<string, unknown> = { receiptNumber: null };
    const conflicts: IrpfConflict[] = [];
    mergeProtocolFields(merged, makeIncoming({ receiptNumber: 'REC-001' }), true, conflicts);
    expect(merged.receiptNumber).toBe('REC-001');
    expect(conflicts).toHaveLength(0);
  });

  it('overwrites receiptNumber when incoming is from receipt', () => {
    const merged: Record<string, unknown> = { receiptNumber: 'REC-OLD' };
    const conflicts: IrpfConflict[] = [];
    mergeProtocolFields(merged, makeIncoming({ receiptNumber: 'REC-NEW' }), true, conflicts);
    expect(merged.receiptNumber).toBe('REC-NEW');
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].resolvedSource).toBe('receipt');
    expect(conflicts[0].needsReview).toBe(true);
  });

  it('does not overwrite receiptNumber when incoming is from declaration and existing exists', () => {
    const merged: Record<string, unknown> = { receiptNumber: 'REC-EXISTING' };
    const conflicts: IrpfConflict[] = [];
    mergeProtocolFields(merged, makeIncoming({ receiptNumber: 'REC-DECL' }), false, conflicts);
    expect(merged.receiptNumber).toBe('REC-EXISTING');
    expect(conflicts).toHaveLength(1);
  });

  it('sets deliveryTimestamp when existing is null and incoming is receipt', () => {
    const merged: Record<string, unknown> = { deliveryTimestamp: null };
    const conflicts: IrpfConflict[] = [];
    mergeProtocolFields(merged, makeIncoming(), true, conflicts);
    expect(merged.deliveryTimestamp).toBeInstanceOf(Date);
  });

  it('skips receiptNumber when incoming is null', () => {
    const merged: Record<string, unknown> = { receiptNumber: 'REC-KEEP' };
    const conflicts: IrpfConflict[] = [];
    mergeProtocolFields(merged, makeIncoming({ receiptNumber: null }), true, conflicts);
    expect(merged.receiptNumber).toBe('REC-KEEP');
    expect(conflicts).toHaveLength(0);
  });
});

describe('mergeFinancialFields()', () => {
  it('fills a null financial field from incoming', () => {
    const merged: Record<string, unknown> = { totalTaxableIncome: null };
    const conflicts: IrpfConflict[] = [];
    mergeFinancialFields(merged, makeIncoming({ totalTaxableIncome: 100000 }), false, conflicts);
    expect(merged.totalTaxableIncome).toBe('100000');
    expect(conflicts).toHaveLength(0);
  });

  it('does not produce conflict when diff <= 1', () => {
    const merged: Record<string, unknown> = { totalTaxableIncome: '100000' };
    const conflicts: IrpfConflict[] = [];
    mergeFinancialFields(merged, makeIncoming({ totalTaxableIncome: 100000.5 }), false, conflicts);
    expect(conflicts).toHaveLength(0);
  });

  it('produces conflict with needsReview: false when diff is between 1 and 100', () => {
    // diff = 50: > 1 but <= 100 → conflict without needsReview
    const merged: Record<string, unknown> = { totalTaxableIncome: '100000' };
    const conflicts: IrpfConflict[] = [];
    mergeFinancialFields(merged, makeIncoming({ totalTaxableIncome: 99950 }), false, conflicts);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].field).toBe('totalTaxableIncome');
    expect(conflicts[0].needsReview).toBe(false);
  });

  it('marks needsReview: true when diff > 100', () => {
    const merged: Record<string, unknown> = { totalTaxableIncome: '100000' };
    const conflicts: IrpfConflict[] = [];
    mergeFinancialFields(merged, makeIncoming({ totalTaxableIncome: 99000 }), true, conflicts);
    expect(conflicts[0].needsReview).toBe(true);
  });

  it('skips fields where incoming value is null', () => {
    const merged: Record<string, unknown> = { totalExclusiveIncome: null };
    const conflicts: IrpfConflict[] = [];
    mergeFinancialFields(merged, makeIncoming({ totalExclusiveIncome: null }), false, conflicts);
    expect(merged.totalExclusiveIncome).toBeNull();
    expect(conflicts).toHaveLength(0);
  });

  it('assigns receipt value and declaration value correctly based on source', () => {
    const merged: Record<string, unknown> = { totalTaxableIncome: '100000' };
    const conflicts: IrpfConflict[] = [];
    mergeFinancialFields(merged, makeIncoming({ totalTaxableIncome: 95000 }), true, conflicts);
    // incoming is receipt, existing is declaration
    expect(conflicts[0].receiptValue).toBe(95000);
    expect(conflicts[0].declarationValue).toBe(100000);
  });
});

describe('mergeListFields()', () => {
  it('fills empty list from incoming', () => {
    const merged: Record<string, unknown> = { dependents: [] };
    mergeListFields(merged, makeIncoming());
    expect((merged.dependents as unknown[]).length).toBe(1);
  });

  it('fills null list from incoming', () => {
    const merged: Record<string, unknown> = { assets: null };
    mergeListFields(merged, makeIncoming());
    expect((merged.assets as unknown[]).length).toBe(1);
  });

  it('does not overwrite existing non-empty list', () => {
    const existingDependent = { name: 'Pedro', cpf: null, birthDate: null, relationship: 'Filho' };
    const merged: Record<string, unknown> = {
      dependents: [existingDependent, { name: 'Ana', cpf: null, birthDate: null, relationship: 'Filha' }],
    };
    mergeListFields(merged, makeIncoming());
    expect((merged.dependents as unknown[]).length).toBe(2);
  });

  it('does not fill when incoming list is empty', () => {
    const merged: Record<string, unknown> = { dependents: [] };
    mergeListFields(merged, makeIncoming({ dependents: [] }));
    expect((merged.dependents as unknown[]).length).toBe(0);
  });
});

describe('runMergePipeline()', () => {
  it('runs all four merges and returns updated record and conflicts', () => {
    const existing: Record<string, unknown> = {
      fullName: null,
      receiptNumber: null,
      deliveryTimestamp: null,
      totalTaxableIncome: null,
      totalDeductions: null,
      dependents: [],
      assets: [],
    };
    const incoming = makeIncoming();
    const { merged, conflicts } = runMergePipeline(existing, incoming, { type: 'receipt', label: 'Recibo', hasNativeText: true }, []);

    expect(merged.fullName).toBe('João Silva');
    expect(merged.receiptNumber).toBe('REC-001');
    expect(merged.deliveryTimestamp).toBeInstanceOf(Date);
    expect(merged.totalTaxableIncome).toBe('100000');
    expect((merged.dependents as unknown[]).length).toBe(1);
    expect(conflicts).toHaveLength(0);
  });

  it('preserves previous conflicts', () => {
    const previousConflict: IrpfConflict = {
      field: 'receiptNumber',
      receiptValue: 'OLD',
      declarationValue: 'OLD-DECL',
      resolvedValue: 'OLD',
      resolvedSource: 'receipt',
      needsReview: true,
    };
    const { conflicts } = runMergePipeline(
      {},
      makeIncoming({ receiptNumber: null }),
      { type: 'declaration', label: 'Declaração', hasNativeText: true },
      [previousConflict],
    );
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].field).toBe('receiptNumber');
  });

  it('does not mutate the original existing record', () => {
    const existing: Record<string, unknown> = { fullName: null };
    runMergePipeline(existing, makeIncoming(), { type: 'declaration', label: 'Declaração', hasNativeText: true }, []);
    expect(existing.fullName).toBeNull();
  });
});
