import { pgTable, uuid, date, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { drawees } from './drawees';
import { economicGroups } from './economic-groups';

export const draweeGroups = pgTable('drawee_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  draweeId: uuid('drawee_id').notNull().references(() => drawees.id, { onDelete: 'cascade' }),
  economicGroupId: uuid('economic_group_id').notNull().references(() => economicGroups.id, { onDelete: 'cascade' }),
  joinedAt: date('joined_at'),
  leftAt: date('left_at'),
  isHeadquarters: boolean('is_headquarters').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  draweeIdx: index('idx_drawee_groups_drawee').on(table.draweeId),
  groupIdx: index('idx_drawee_groups_group').on(table.economicGroupId),
}));
