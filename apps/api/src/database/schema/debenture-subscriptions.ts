import { pgTable, uuid, text, numeric, date, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { debentureSeries } from './debenture-series';
import { clients } from './clients';

export const debentureSubscriptions = pgTable('debenture_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  seriesId: uuid('series_id').notNull().references(() => debentureSeries.id, { onDelete: 'restrict' }),
  debenturistId: uuid('debenturist_id').notNull().references(() => clients.id, { onDelete: 'restrict' }),
  subscriptionDate: date('subscription_date').notNull(),
  unitPriceAtSub: numeric('unit_price_at_sub', { precision: 16, scale: 7 }).notNull(),
  quantity: integer('quantity').notNull(),
  totalValue: numeric('total_value', { precision: 15, scale: 2 }).notNull(),
  redeemedQuantity: integer('redeemed_quantity').notNull().default(0),
  balanceQuantity: integer('balance_quantity').notNull(),
  status: text('status').notNull().default('active'),
  legacySgsId: integer('legacy_sgs_id'),
  legacyNfId: integer('legacy_nf_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  seriesIdx: index('idx_debenture_subscriptions_series').on(table.seriesId),
  debenturistIdx: index('idx_debenture_subscriptions_debenturist').on(table.debenturistId),
  statusIdx: index('idx_debenture_subscriptions_status').on(table.status),
  dateIdx: index('idx_debenture_subscriptions_date').on(table.subscriptionDate),
}));
