import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { drawees } from './drawees';

export const vaduDraweePersonResults = pgTable('vadu_drawee_person_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  draweeId: uuid('drawee_id').notNull().references(() => drawees.id, { onDelete: 'cascade' }),

  cpf: text('cpf'),
  name: text('name'),
  birthDate: timestamp('birth_date'),
  motherName: text('mother_name'),

  rawData: jsonb('raw_data'),
  queriedAt: timestamp('queried_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  draweeIdx: index('idx_vadu_drawee_person_drawee').on(table.draweeId),
  cpfIdx: index('idx_vadu_drawee_person_cpf').on(table.cpf),
}));
