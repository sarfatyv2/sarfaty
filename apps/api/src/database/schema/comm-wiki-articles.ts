import { pgTable, uuid, text, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';
import { commWikiCategories } from './comm-wiki-categories';

export const commWikiArticles = pgTable('comm_wiki_articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').notNull().references(() => commWikiCategories.id),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: jsonb('content'),
  youtubeVideoId: text('youtube_video_id'),
  status: text('status').notNull().default('draft'),
  authorId: uuid('author_id').notNull().references(() => profiles.id),
  lastUpdatedBy: uuid('last_updated_by').references(() => profiles.id),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_comm_wiki_articles_slug').on(table.slug),
  index('idx_comm_wiki_articles_category').on(table.categoryId),
  index('idx_comm_wiki_articles_status').on(table.status),
]);
