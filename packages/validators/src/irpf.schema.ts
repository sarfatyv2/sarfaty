import { z } from 'zod';

export const irpfDependentSchema = z.object({
  name: z.string().min(1),
  cpf: z.string().length(11).nullable(),
  birthDate: z.string().nullable(),
  relationship: z.string(),
});

export const irpfIncomeItemSchema = z.object({
  sourceName: z.string().nullable(),
  sourceCnpj: z.string().nullable(),
  grossIncome: z.number(),
  taxWithheld: z.number(),
  socialSecurity: z.number().nullable(),
  thirteenthSalary: z.number().nullable(),
});

export const irpfExemptIncomeItemSchema = z.object({
  code: z.string().nullable(),
  description: z.string().nullable(),
  beneficiaryName: z.string().nullable(),
  beneficiaryCpfCnpj: z.string().nullable(),
  amount: z.number(),
});

export const irpfExclusiveIncomeItemSchema = z.object({
  code: z.string().nullable(),
  description: z.string().nullable(),
  beneficiaryName: z.string().nullable(),
  beneficiaryCpfCnpj: z.string().nullable(),
  amount: z.number(),
});

export const irpfPaymentSchema = z.object({
  code: z.string(),
  description: z.string().nullable(),
  beneficiaryName: z.string().nullable(),
  beneficiaryCpfCnpj: z.string().nullable(),
  amount: z.number(),
  refundAmount: z.number().nullable(),
});

export const irpfAssetSchema = z.object({
  groupCode: z.string().nullable(),
  itemCode: z.string().nullable(),
  description: z.string().nullable(),
  situation: z.string().nullable(),
  valuePreviousYear: z.number(),
  valueCurrentYear: z.number(),
});

export const irpfDebtSchema = z.object({
  code: z.string().nullable(),
  description: z.string().nullable(),
  creditorName: z.string().nullable(),
  creditorCpfCnpj: z.string().nullable(),
  valuePreviousYear: z.number(),
  valueCurrentYear: z.number(),
});

export const irpfConflictSchema = z.object({
  field: z.string(),
  receiptValue: z.unknown(),
  declarationValue: z.unknown(),
  resolvedValue: z.unknown(),
  resolvedSource: z.enum(['receipt', 'declaration']),
  needsReview: z.boolean(),
});

export const irpfFieldEvidenceSchema = z.object({
  field: z.string(),
  value: z.unknown(),
  source: z.enum(['receipt', 'declaration']),
  confidence: z.enum(['high', 'medium', 'low']),
  page: z.number().nullable(),
  lineSnippet: z.string().nullable(),
});

export const irpfRawExtractionSchema = z.object({
  // Document context
  cpf: z.string().length(11).nullable(),
  fullName: z.string().nullable(),
  exerciseYear: z.number().int().nullable(),
  calendarYear: z.number().int().nullable(),
  declarationType: z.enum(['original', 'rectifying']).nullable(),
  taxationOption: z.enum(['deductions', 'simplified']).nullable(),
  receiptNumber: z.string().nullable(),
  deliveryTimestamp: z.string().nullable(),

  // Identification
  birthDate: z.string().nullable(),
  occupation: z.string().nullable(),
  occupationCode: z.string().nullable(),
  nationality: z.string().nullable(),
  naturality: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),

  // Address
  addressStreet: z.string().nullable(),
  addressNumber: z.string().nullable(),
  addressComplement: z.string().nullable(),
  addressNeighborhood: z.string().nullable(),
  addressCity: z.string().nullable(),
  addressState: z.string().max(2).nullable(),
  addressZip: z.string().nullable(),

  // Spouse
  spouseName: z.string().nullable(),
  spouseCpf: z.string().nullable(),

  // Financial summary
  totalTaxableIncome: z.number().nullable(),
  totalExemptIncome: z.number().nullable(),
  totalExclusiveIncome: z.number().nullable(),
  totalDeductions: z.number().nullable(),
  taxableBase: z.number().nullable(),
  taxDue: z.number().nullable(),
  taxPaid: z.number().nullable(),
  taxRefund: z.number().nullable(),
  taxBalance: z.number().nullable(),
  totalAssetsCurrentYear: z.number().nullable(),
  totalAssetsPreviousYear: z.number().nullable(),
  totalDebtsCurrentYear: z.number().nullable(),
  totalDebtsPreviousYear: z.number().nullable(),

  // Lists
  dependents: z.array(irpfDependentSchema).default([]),
  taxableIncomeItems: z.array(irpfIncomeItemSchema).default([]),
  exemptIncomeItems: z.array(irpfExemptIncomeItemSchema).default([]),
  exclusiveIncomeItems: z.array(irpfExclusiveIncomeItemSchema).default([]),
  payments: z.array(irpfPaymentSchema).default([]),
  assets: z.array(irpfAssetSchema).default([]),
  debts: z.array(irpfDebtSchema).default([]),

  // Extraction metadata
  confidence: z.enum(['high', 'medium', 'low']).nullable(),
  evidence: z.array(irpfFieldEvidenceSchema).default([]),
});

export type IrpfRawExtraction = z.infer<typeof irpfRawExtractionSchema>;
export type IrpfDependentDto = z.infer<typeof irpfDependentSchema>;
export type IrpfIncomeItemDto = z.infer<typeof irpfIncomeItemSchema>;
export type IrpfPaymentDto = z.infer<typeof irpfPaymentSchema>;
export type IrpfAssetDto = z.infer<typeof irpfAssetSchema>;
export type IrpfDebtDto = z.infer<typeof irpfDebtSchema>;
export type IrpfConflictDto = z.infer<typeof irpfConflictSchema>;
