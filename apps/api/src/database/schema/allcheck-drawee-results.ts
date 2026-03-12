import { pgTable, uuid, text, boolean, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { drawees } from './drawees';

export const allcheckDraweeResults = pgTable('allcheck_drawee_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  draweeId: uuid('drawee_id').notNull().references(() => drawees.id, { onDelete: 'cascade' }),
  document: text('document'),
  name: text('name'),
  emails: jsonb('emails'),
  currentAddress: jsonb('current_address'),
  addressHistory: jsonb('address_history'),
  phones: jsonb('phones'),
  partners: jsonb('partners'),
  companyData: jsonb('company_data'),
  isPep: boolean('is_pep').notNull().default(false),
  vehicles: jsonb('vehicles'),
  ccfOccurrences: integer('ccf_occurrences').notNull().default(0),
  consultationNetwork: jsonb('consultation_network'),
  rawData: jsonb('raw_data'),
  queriedAt: timestamp('queried_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  draweeIdx: index('idx_allcheck_drawee_results_drawee').on(table.draweeId),
}));
