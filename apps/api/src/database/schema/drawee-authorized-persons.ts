import { pgTable, uuid, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { drawees } from './drawees';

export const draweeAuthorizedPersons = pgTable('drawee_authorized_persons', {
  id: uuid('id').primaryKey().defaultRandom(),
  draweeId: uuid('drawee_id').notNull().references(() => drawees.id, { onDelete: 'cascade' }),
  authorizationType: text('authorization_type'), // 'partner' | 'administrator' | 'attorney' | 'legal_representative' | 'authorized'
  fullName: text('full_name').notNull(),
  cpf: text('cpf'),
  phone: text('phone'),
  email: text('email'),
  source: text('source'), // 'manual' | 'vadu' | 'serasa' | 'brasilapi' | 'creditbox'
  sourceQueriedAt: timestamp('source_queried_at', { withTimezone: true }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  draweeIdx: index('idx_drawee_auth_persons_drawee').on(table.draweeId),
  activeIdx: index('idx_drawee_auth_persons_active').on(table.isActive),
  cpfIdx: index('idx_drawee_auth_persons_cpf').on(table.cpf),
  sourceIdx: index('idx_drawee_auth_persons_source').on(table.draweeId, table.source),
}));
