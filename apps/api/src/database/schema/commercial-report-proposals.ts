import { pgTable, uuid, text, numeric, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { clientCommercialReports } from './client-commercial-reports';

export const commercialReportProposals = pgTable(
  'commercial_report_proposals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reportId: uuid('report_id')
      .notNull()
      .references(() => clientCommercialReports.id, { onDelete: 'cascade' }),
    modality: text('modality'),
    limitAmount: numeric('limit_amount', { precision: 15, scale: 2 }),
    guarantee: text('guarantee'),
    rate: text('rate'),
    concentrationPct: numeric('concentration_pct', { precision: 5, scale: 2 }),
    term: text('term'),
    tranche: text('tranche'),
    tacValue: numeric('tac_value', { precision: 15, scale: 2 }),
    boletoTariff: numeric('boleto_tariff', { precision: 15, scale: 2 }),
    tedValue: numeric('ted_value', { precision: 15, scale: 2 }),
    serasa: text('serasa'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    reportIdx: index('idx_commercial_report_proposals_report').on(table.reportId),
  }),
);
