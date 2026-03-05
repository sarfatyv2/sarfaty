import { pgTable, uuid, text, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { drawees } from './drawees';

export const digitalPresenceDraweeResults = pgTable('digital_presence_drawee_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  draweeId: uuid('drawee_id').notNull().references(() => drawees.id, { onDelete: 'cascade' }),

  domain: text('domain'),
  emailType: text('email_type').notNull(),
  hasDns: boolean('has_dns').notNull().default(false),
  hasActiveSite: boolean('has_active_site').notNull().default(false),
  siteTitle: text('site_title'),

  rawData: jsonb('raw_data'),
  queriedAt: timestamp('queried_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  draweeIdx: index('idx_digital_presence_drawee_drawee').on(table.draweeId),
}));
