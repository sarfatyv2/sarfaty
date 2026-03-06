import { pgTable, uuid, text, boolean, timestamp, index, numeric } from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const clientAuthorizedPersons = pgTable('client_authorized_persons', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  authorizationType: text('authorization_type'),  // 'partner' | 'attorney' | 'legal_representative' | 'authorized' | 'administrator'
  fullName: text('full_name').notNull(),
  cpf: text('cpf'),
  phone: text('phone'),
  email: text('email'),
  source: text('source'),  // 'manual' | 'vadu' | 'serasa' | 'brasilapi' | 'creditbox'
  sourceQueriedAt: timestamp('source_queried_at', { withTimezone: true }),
  // Serasa QSA fields
  joinedAt: timestamp('joined_at', { withTimezone: true }),      // sinceDate (partners) | mandateStart (directors)
  mandateEndAt: timestamp('mandate_end_at', { withTimezone: true }),
  role: text('role'),
  participationPercentage: numeric('participation_percentage', { precision: 6, scale: 2 }),
  capitalTotalValue: numeric('capital_total_value', { precision: 20, scale: 2 }),
  restrictionSign: text('restriction_sign'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  clientIdx: index('idx_client_auth_persons_client').on(table.clientId),
  activeIdx: index('idx_client_auth_persons_active').on(table.isActive),
  cpfIdx: index('idx_client_auth_persons_cpf').on(table.cpf),
  sourceIdx: index('idx_client_auth_persons_source').on(table.clientId, table.source),
}));
