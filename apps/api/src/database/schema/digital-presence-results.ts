import { pgTable, uuid, text, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const digitalPresenceResults = pgTable('digital_presence_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id),

  domain: text('domain'),
  emailType: text('email_type').notNull(), // 'corporate' | 'free' | 'unknown'
  hasDns: boolean('has_dns').notNull().default(false),
  hasActiveSite: boolean('has_active_site').notNull().default(false),
  siteTitle: text('site_title'),

  rawData: jsonb('raw_data'),
  queriedAt: timestamp('queried_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  clientIdx: index('idx_digital_presence_results_client').on(table.clientId),
}));
