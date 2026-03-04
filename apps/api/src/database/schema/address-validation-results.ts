import { pgTable, uuid, text, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const addressValidationResults = pgTable('address_validation_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id),

  cep: text('cep'),
  isValid: boolean('is_valid').notNull().default(false),
  street: text('street'),
  neighborhood: text('neighborhood'),
  city: text('city'),
  state: text('state'),
  matchesRegistered: boolean('matches_registered'),

  rawData: jsonb('raw_data'),
  queriedAt: timestamp('queried_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  clientIdx: index('idx_address_validation_results_client').on(table.clientId),
}));
