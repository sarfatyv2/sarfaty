import { z } from 'zod';
import { uuidSchema } from './common';

export const createCommercialReportSchema = z.object({
  // Metadados
  visitDate: z.string().date().optional(),
  reportDate: z.string().date().optional(),
  proposalType: z.string().optional(),

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
});

export const updateCommercialReportSchema = createCommercialReportSchema.partial();

export type CreateCommercialReportDto = z.infer<typeof createCommercialReportSchema>;
export type UpdateCommercialReportDto = z.infer<typeof updateCommercialReportSchema>;
