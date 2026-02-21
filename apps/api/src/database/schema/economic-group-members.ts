import { pgTable, uuid, text, date, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { economicGroups } from './economic-groups';
import { clients } from './clients';

export const economicGroupMembers = pgTable('economic_group_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  economicGroupId: uuid('economic_group_id').notNull().references(() => economicGroups.id, { onDelete: 'cascade' }),
  memberType: text('member_type').notNull(),  // 'client' | 'drawee' | 'supplier' | 'company'
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
  // drawee_id and supplier_id are added via ALTER TABLE after those tables are created
  joinedAt: date('joined_at'),
  leftAt: date('left_at'),
  isHeadquarters: boolean('is_headquarters').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  groupIdx: index('idx_eg_members_group').on(table.economicGroupId),
  memberTypeIdx: index('idx_eg_members_type').on(table.memberType),
  clientIdx: index('idx_eg_members_client').on(table.clientId),
}));
