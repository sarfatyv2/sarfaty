import { pgTable, uuid, text, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const pepCheckResults = pgTable('pep_check_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id),

  cpf: text('cpf'),
  personName: text('person_name'),
  hasMatch: boolean('has_match').notNull().default(false),
  matchedRole: text('matched_role'),
  matchedOrg: text('matched_org'),

  rawData: jsonb('raw_data'),
  queriedAt: timestamp('queried_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  clientIdx: index('idx_pep_check_results_client').on(table.clientId),
  cpfIdx: index('idx_pep_check_results_cpf').on(table.cpf),
}));
