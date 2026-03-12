import { pgTable, uuid, text, boolean, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const allcheckResults = pgTable('allcheck_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id),
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
  clientIdx: index('idx_allcheck_results_client').on(table.clientId),
}));
