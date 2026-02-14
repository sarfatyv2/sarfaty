import { pgTable, uuid, text, timestamp, index, jsonb } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';
import { clients } from './clients';

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  clientId: uuid('client_id').references(() => clients.id),
  metadata: jsonb('metadata'),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  profileIdx: index('idx_notifications_profile').on(table.profileId, table.readAt),
}));
