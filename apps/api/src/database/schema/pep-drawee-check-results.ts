import { pgTable, uuid, text, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { drawees } from './drawees';

export const pepDraweeCheckResults = pgTable('pep_drawee_check_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  draweeId: uuid('drawee_id').notNull().references(() => drawees.id, { onDelete: 'cascade' }),

  cpf: text('cpf'),
  personName: text('person_name'),
  hasMatch: boolean('has_match').notNull().default(false),
  matchedRole: text('matched_role'),
  matchedOrg: text('matched_org'),

  rawData: jsonb('raw_data'),
  queriedAt: timestamp('queried_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  draweeIdx: index('idx_pep_drawee_check_drawee').on(table.draweeId),
  cpfIdx: index('idx_pep_drawee_check_cpf').on(table.cpf),
}));
