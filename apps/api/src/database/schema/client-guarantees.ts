import { pgTable, uuid, text, numeric, timestamp, index } from 'drizzle-orm/pg-core';
import { clients } from './clients';
import { guaranteeTypes } from './guarantee-types';

export const clientGuarantees = pgTable('client_guarantees', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  guaranteeTypeId: uuid('guarantee_type_id').notNull().references(() => guaranteeTypes.id),
  description: text('description'),
  estimatedValue: numeric('estimated_value', { precision: 15, scale: 2 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  clientIdx: index('idx_client_guarantees_client').on(table.clientId),
}));
