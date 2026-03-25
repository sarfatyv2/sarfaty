import { pgTable, uuid, text, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { clientCommercialReports } from './client-commercial-reports';

export const commercialReportGuarantors = pgTable(
  'commercial_report_guarantors',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reportId: uuid('report_id')
      .notNull()
      .references(() => clientCommercialReports.id, { onDelete: 'cascade' }),
    fullName: text('full_name').notNull(),
    cpf: text('cpf'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    reportIdx: index('idx_commercial_report_guarantors_report').on(table.reportId),
  }),
);
