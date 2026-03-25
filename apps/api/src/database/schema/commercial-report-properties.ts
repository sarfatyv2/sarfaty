import { pgTable, uuid, text, numeric, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { clientCommercialReports } from './client-commercial-reports';

export const commercialReportProperties = pgTable(
  'commercial_report_properties',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reportId: uuid('report_id')
      .notNull()
      .references(() => clientCommercialReports.id, { onDelete: 'cascade' }),
    propertyName: text('property_name'),
    situation: text('situation'),
    totalArea: text('total_area'),
    builtArea: text('built_area'),
    appraisedValue: numeric('appraised_value', { precision: 15, scale: 2 }),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    reportIdx: index('idx_commercial_report_properties_report').on(table.reportId),
  }),
);
