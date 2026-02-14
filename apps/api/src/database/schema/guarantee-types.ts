import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const guaranteeTypes = pgTable('guarantee_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  code: text('code').notNull().unique(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
