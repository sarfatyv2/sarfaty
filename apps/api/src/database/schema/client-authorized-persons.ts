import { pgTable, uuid, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';
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
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  clientIdx: index('idx_client_auth_persons_client').on(table.clientId),
  activeIdx: index('idx_client_auth_persons_active').on(table.isActive),
  cpfIdx: index('idx_client_auth_persons_cpf').on(table.cpf),
  sourceIdx: index('idx_client_auth_persons_source').on(table.clientId, table.source),
}));
