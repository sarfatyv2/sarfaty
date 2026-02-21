import { pgTable, uuid, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { economicGroups } from './economic-groups';

export const economicGroupPersons = pgTable('economic_group_persons', {
  id: uuid('id').primaryKey().defaultRandom(),
  economicGroupId: uuid('economic_group_id').notNull().references(() => economicGroups.id, { onDelete: 'cascade' }),
  relationshipType: text('relationship_type'),  // 'partner' | 'administrator' | 'attorney' | 'representative'
  fullName: text('full_name').notNull(),
  cpfCnpj: text('cpf_cnpj'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  groupIdx: index('idx_eg_persons_group').on(table.economicGroupId),
  activeIdx: index('idx_eg_persons_active').on(table.isActive),
}));
