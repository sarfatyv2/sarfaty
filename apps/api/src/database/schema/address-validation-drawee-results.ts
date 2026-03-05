import { pgTable, uuid, text, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { drawees } from './drawees';

export const addressValidationDraweeResults = pgTable('address_validation_drawee_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  draweeId: uuid('drawee_id').notNull().references(() => drawees.id, { onDelete: 'cascade' }),

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
  draweeIdx: index('idx_address_validation_drawee_drawee').on(table.draweeId),
}));
