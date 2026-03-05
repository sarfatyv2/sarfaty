import { pgTable, uuid, text, boolean, numeric, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { drawees } from './drawees';

export const sanctionsDraweeCheckResults = pgTable('sanctions_drawee_check_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  draweeId: uuid('drawee_id').notNull().references(() => drawees.id, { onDelete: 'cascade' }),

  entityName: text('entity_name'),
  documentSearched: text('document_searched'),
  source: text('source').notNull(),
  hasMatch: boolean('has_match').notNull().default(false),
  matchScore: numeric('match_score', { precision: 5, scale: 4 }),
  matchDetails: text('match_details'),

  rawData: jsonb('raw_data'),
  queriedAt: timestamp('queried_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  draweeIdx: index('idx_sanctions_drawee_check_drawee').on(table.draweeId),
  sourceIdx: index('idx_sanctions_drawee_check_source').on(table.source),
}));
