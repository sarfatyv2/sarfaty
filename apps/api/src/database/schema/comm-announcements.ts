import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';

export const commAnnouncements = pgTable('comm_announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  coverImageUrl: text('cover_image_url'),
  targetRoles: text('target_roles').array().notNull().default([]),
  authorId: uuid('author_id').notNull().references(() => profiles.id),
  status: text('status').notNull().default('draft'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_comm_announcements_status').on(table.status),
  index('idx_comm_announcements_published').on(table.publishedAt),
  index('idx_comm_announcements_expires').on(table.expiresAt),
]);
