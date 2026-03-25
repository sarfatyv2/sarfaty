import { z } from 'zod';

export const commercialReportReceiptMethodRowSchema = z.object({
  receiptForm: z.string().optional(),
  pmr: z.coerce.number().optional(),
  salesPercent: z.coerce.number().min(0).max(100).optional(),
});

export const commercialReportSupplierPaymentRowSchema = z.object({
  paymentForm: z.string().optional(),
  purchasesPercent: z.coerce.number().min(0).max(100).optional(),
  averagePaymentDays: z.coerce.number().int().min(0).optional(),
});

export const commercialReportProposalInputSchema = z.object({
  modality: z.string().optional(),
  limitAmount: z.coerce.number().min(0).optional(),
  guarantee: z.string().optional(),
  rate: z.string().optional(),
  concentrationPct: z.coerce.number().min(0).max(100).optional(),
  term: z.string().optional(),
  tranche: z.string().optional(),
  tacValue: z.coerce.number().min(0).optional(),
  boletoTariff: z.coerce.number().min(0).optional(),
  tedValue: z.coerce.number().min(0).optional(),
  serasa: z.string().optional(),
});

export const commercialReportGuarantorInputSchema = z.object({
  fullName: z.string().optional(),
  cpf: z.string().optional(),
});

export const commercialReportPropertyInputSchema = z.object({
  propertyName: z.string().optional(),
  situation: z.string().optional(),
  totalArea: z.string().optional(),
  builtArea: z.string().optional(),
  appraisedValue: z.coerce.number().min(0).optional(),
});

export const createCommercialReportSchema = z.object({
  // Metadados
  visitDate: z.string().date().optional(),
  reportDate: z.string().date().optional(),
  proposalType: z.string().optional(),

  employeeCount: z.coerce.number().int().min(0).optional(),
  referralSource: z.string().optional(),
  averageTicket: z.string().optional(),
  operationNotes: z.string().optional(),
  serasaNotes: z.string().optional(),
  partnersNotes: z.string().optional(),
  relatedCompaniesNotes: z.string().optional(),
  mainProducts: z.string().optional(),
  anticipaGrandesRedes: z.boolean().optional(),
  anticipaGrandesRedesList: z.string().optional(),
  preBillingPercentage: z.coerce.number().min(0).max(100).optional(),
  cteDays: z.coerce.number().int().min(0).optional(),
  salesSouthPercentage: z.coerce.number().min(0).max(100).optional(),
  salesSoutheastPercentage: z.coerce.number().min(0).max(100).optional(),
  salesNorthPercentage: z.coerce.number().min(0).max(100).optional(),
  salesNortheastPercentage: z.coerce.number().min(0).max(100).optional(),
  salesMidwestPercentage: z.coerce.number().min(0).max(100).optional(),

  // Dados Produtivos
  installedCapacity: z.string().optional(),
  utilizedCapacity: z.string().optional(),
  productiveCapacity: z.string().optional(),
  mainClients: z.string().optional(),
  mainSuppliers: z.string().optional(),
  inventory: z.string().optional(),

  // Financeiro
  grossPayroll: z.coerce.number().min(0).optional(),
  accountsReceivable: z.coerce.number().min(0).optional(),
  availableCash: z.coerce.number().min(0).optional(),
  advancesToSuppliers: z.coerce.number().min(0).optional(),
  advancesFromClients: z.coerce.number().min(0).optional(),
  inventoryValue: z.coerce.number().min(0).optional(),
  banksBalance: z.coerce.number().min(0).optional(),
  fundsBalance: z.coerce.number().min(0).optional(),
  suppliersBalance: z.coerce.number().min(0).optional(),

  receiptMethodsDetail: z.array(commercialReportReceiptMethodRowSchema).optional(),
  externalReceiptMethodsDetail: z.array(commercialReportReceiptMethodRowSchema).optional(),
  suppliersDetail: z.array(commercialReportSupplierPaymentRowSchema).optional(),

  // Concentração
  concentration: z.coerce.number().min(0).max(100).optional(),
  concentrationDrawee: z.coerce.number().min(0).max(100).optional(),

  // Vendas
  salesPercentageCash: z.coerce.number().min(0).max(100).optional(),
  salesPercentageTerm: z.coerce.number().min(0).max(100).optional(),
  internalMarketPercentage: z.coerce.number().min(0).max(100).optional(),
  externalMarketPercentage: z.coerce.number().min(0).max(100).optional(),

  // Logística e Prazos
  averagePaymentTerm: z.coerce.number().int().min(0).optional(),
  averageReceiptTerm: z.coerce.number().int().min(0).optional(),
  averageDeliveryTime: z.coerce.number().int().min(0).optional(),
  transportType: z.string().optional(),
  deliveredPercentage: z.coerce.number().min(0).max(100).optional(),
  shippedPercentage: z.coerce.number().min(0).max(100).optional(),
  deliveryProofType: z.string().optional(),
  hasCarrierSiteAccess: z.boolean().optional(),

  paymentMethods: z.string().optional(),
  receiptMethods: z.string().optional(),

  // Tarifas
  tacValue: z.coerce.number().min(0).optional(),
  tedValue: z.coerce.number().min(0).optional(),
  boletoTariff: z.coerce.number().min(0).optional(),
  notaryTerm: z.coerce.number().int().min(0).optional(),
  expiredTitleTariff: z.coerce.number().min(0).optional(),
  protestedTitleTariff: z.coerce.number().min(0).optional(),
  sustainedTitleTariff: z.coerce.number().min(0).optional(),

  // Comercial
  commercialDefense: z.string().optional(),

  proposals: z.array(commercialReportProposalInputSchema).optional(),
  guarantors: z.array(commercialReportGuarantorInputSchema).optional(),
  properties: z.array(commercialReportPropertyInputSchema).optional(),
});

export const updateCommercialReportSchema = createCommercialReportSchema.partial();

export type CreateCommercialReportDto = z.infer<typeof createCommercialReportSchema>;
export type UpdateCommercialReportDto = z.infer<typeof updateCommercialReportSchema>;
