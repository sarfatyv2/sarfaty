import { pgTable, uuid, numeric, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { debentureSubscriptions } from './debenture-subscriptions';

export const debentureRedemptions = pgTable('debenture_redemptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  subscriptionId: uuid('subscription_id').notNull().references(() => debentureSubscriptions.id, { onDelete: 'restrict' }),
  requestedAt: timestamp('requested_at', { withTimezone: true }).notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  settledAt: timestamp('settled_at', { withTimezone: true }),
  quantity: integer('quantity').notNull(),
  unitPriceAtSub: numeric('unit_price_at_sub', { precision: 15, scale: 2 }),
  unitPriceAtRed: numeric('unit_price_at_red', { precision: 15, scale: 2 }),
  investedValue: numeric('invested_value', { precision: 15, scale: 2 }),
  grossRedemption: numeric('gross_redemption', { precision: 15, scale: 2 }),
  grossYield: numeric('gross_yield', { precision: 15, scale: 2 }),
  irWithheld: numeric('ir_withheld', { precision: 15, scale: 2 }),
  iofWithheld: numeric('iof_withheld', { precision: 15, scale: 2 }),
  netRedemption: numeric('net_redemption', { precision: 15, scale: 2 }),
  netYield: numeric('net_yield', { precision: 15, scale: 2 }),
  irRate: numeric('ir_rate', { precision: 5, scale: 2 }),
  iofRate: numeric('iof_rate', { precision: 5, scale: 2 }),
  elapsedDays: integer('elapsed_days'),
  iofDays: integer('iof_days'),
  yieldRate: numeric('yield_rate', { precision: 7, scale: 4 }),
  status: integer('status').notNull().default(0),   // 0=pending | 1=processed | 2=settled
  legacySgsId: integer('legacy_sgs_id'),
  legacyNfId: integer('legacy_nf_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  subscriptionIdx: index('idx_debenture_redemptions_subscription').on(table.subscriptionId),
  statusIdx: index('idx_debenture_redemptions_status').on(table.status),
  requestedIdx: index('idx_debenture_redemptions_requested').on(table.requestedAt),
}));
