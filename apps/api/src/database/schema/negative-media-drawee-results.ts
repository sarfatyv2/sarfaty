import { pgTable, uuid, text, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { drawees } from './drawees';

export const negativeMediaDraweeResults = pgTable('negative_media_drawee_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  draweeId: uuid('drawee_id').notNull().references(() => drawees.id, { onDelete: 'cascade' }),

  cnpj: text('cnpj'),
  companyName: text('company_name'),
  riskLevel: text('risk_level').notNull(),
  findingsCount: integer('findings_count').notNull().default(0),
  findings: jsonb('findings'),
  summary: text('summary'),
  groundingSources: jsonb('grounding_sources'),

  rawResponse: jsonb('raw_response'),
  queriedAt: timestamp('queried_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  draweeIdx: index('idx_negative_media_drawee_drawee').on(table.draweeId),
  cnpjIdx: index('idx_negative_media_drawee_cnpj').on(table.cnpj),
}));
