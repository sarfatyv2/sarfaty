import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { regions } from './regions';

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  regionId: uuid('region_id').notNull().references(() => regions.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
