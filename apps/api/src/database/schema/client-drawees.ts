import { pgTable, uuid, text, numeric, integer, date, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { clients } from './clients';
import { drawees } from './drawees';

export const clientDrawees = pgTable('client_drawees', {
  id: uuid('id').primaryKey().defaultRandom(),

  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  draweeId: uuid('drawee_id').notNull().references(() => drawees.id, { onDelete: 'cascade' }),

  status: text('status').notNull().default('active'),
  totalTitles: integer('total_titles').notNull().default(0),
  totalExposure: numeric('total_exposure', { precision: 18, scale: 4 }).notNull().default('0'),
  firstOperationAt: date('first_operation_at'),
  lastOperationAt: date('last_operation_at'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  uniqueClientDrawee: unique('uq_client_drawee').on(table.clientId, table.draweeId),
  draweeIdx: index('idx_client_drawees_drawee').on(table.draweeId),
  clientStatusIdx: index('idx_client_drawees_client_status').on(table.clientId, table.status),
}));
