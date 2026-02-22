import { pgTable, uuid, text, numeric, date, timestamp, index, boolean, integer } from 'drizzle-orm/pg-core';
import { clients } from './clients';
import { profiles } from './profiles';

export const clientCommercialReports = pgTable('client_commercial_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  createdBy: uuid('created_by').notNull().references(() => profiles.id),

  // Metadados
  visitDate: date('visit_date'),
  reportDate: date('report_date'),
  proposalType: text('proposal_type'), // 'Prospecção', 'Manutenção', etc.

  // Dados Produtivos/Operacionais
  installedCapacity: text('installed_capacity'),
  utilizedCapacity: text('utilized_capacity'),
  productiveCapacity: text('productive_capacity'),
  mainClients: text('main_clients'),
  mainSuppliers: text('main_suppliers'),
  inventory: text('inventory'),

  // Financeiro (Meios Circulantes)
  grossPayroll: numeric('gross_payroll', { precision: 15, scale: 2 }),
  accountsReceivable: numeric('accounts_receivable', { precision: 15, scale: 2 }),
  availableCash: numeric('available_cash', { precision: 15, scale: 2 }),
  advancesToSuppliers: numeric('advances_to_suppliers', { precision: 15, scale: 2 }),
  advancesFromClients: numeric('advances_from_clients', { precision: 15, scale: 2 }),

  // Concentração
  concentration: numeric('concentration', { precision: 5, scale: 2 }),
  concentrationDrawee: numeric('concentration_drawee', { precision: 5, scale: 2 }),
  
  // Vendas e Mercado
  salesPercentageCash: numeric('sales_percentage_cash', { precision: 5, scale: 2 }),
  salesPercentageTerm: numeric('sales_percentage_term', { precision: 5, scale: 2 }),
  internalMarketPercentage: numeric('internal_market_percentage', { precision: 5, scale: 2 }),
  externalMarketPercentage: numeric('external_market_percentage', { precision: 5, scale: 2 }),

  // Prazos e Logística
  averagePaymentTerm: integer('average_payment_term'),
  averageReceiptTerm: integer('average_receipt_term'),
  averageDeliveryTime: integer('average_delivery_time'),
  transportType: text('transport_type'),
  deliveredPercentage: numeric('delivered_percentage', { precision: 5, scale: 2 }),
  shippedPercentage: numeric('shipped_percentage', { precision: 5, scale: 2 }),
  deliveryProofType: text('delivery_proof_type'),
  hasCarrierSiteAccess: boolean('has_carrier_site_access'),

  // Formas de recebimento/pagamento (Pode ser texto livre com as formas separadas por vírgula)
  paymentMethods: text('payment_methods'),
  receiptMethods: text('receipt_methods'),

  // Tarifas e Parametrização
  tacValue: numeric('tac_value', { precision: 15, scale: 2 }),
  tedValue: numeric('ted_value', { precision: 15, scale: 2 }),
  boletoTariff: numeric('boleto_tariff', { precision: 15, scale: 2 }),
  notaryTerm: integer('notary_term'),
  expiredTitleTariff: numeric('expired_title_tariff', { precision: 15, scale: 2 }),
  protestedTitleTariff: numeric('protested_title_tariff', { precision: 15, scale: 2 }),
  sustainedTitleTariff: numeric('sustained_title_tariff', { precision: 15, scale: 2 }),

  // Parecer / Defesa Comercial
  commercialDefense: text('commercial_defense'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  clientIdx: index('idx_commercial_reports_client').on(table.clientId),
  createdByIdx: index('idx_commercial_reports_created_by').on(table.createdBy),
  createdAtIdx: index('idx_commercial_reports_created_at').on(table.createdAt),
}));
