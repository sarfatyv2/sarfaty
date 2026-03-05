import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { drawees } from './drawees';

export const cndtDraweeCheckResults = pgTable('cndt_drawee_check_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  draweeId: uuid('drawee_id').notNull().references(() => drawees.id, { onDelete: 'cascade' }),

  cnpj: text('cnpj'),
  certificateStatus: text('certificate_status').notNull(),
  certificateNumber: text('certificate_number'),
  validUntil: timestamp('valid_until', { withTimezone: true }),

  rawData: jsonb('raw_data'),
  queriedAt: timestamp('queried_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  draweeIdx: index('idx_cndt_drawee_check_drawee').on(table.draweeId),
  cnpjIdx: index('idx_cndt_drawee_check_cnpj').on(table.cnpj),
}));
