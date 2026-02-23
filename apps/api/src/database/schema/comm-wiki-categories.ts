import { pgTable, uuid, text, integer, timestamp, index } from 'drizzle-orm/pg-core';

export const commWikiCategories = pgTable('comm_wiki_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  parentId: uuid('parent_id'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_comm_wiki_categories_slug').on(table.slug),
  index('idx_comm_wiki_categories_parent').on(table.parentId),
]);
