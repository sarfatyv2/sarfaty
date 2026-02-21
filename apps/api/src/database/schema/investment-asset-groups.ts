import { pgTable, uuid, text, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';

export const investmentAssetGroups = pgTable('investment_asset_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  subscriptionCutoffTime: text('subscription_cutoff_time'),   // HH:MM
  redemptionCutoffTime: text('redemption_cutoff_time'),       // HH:MM
  redemptionSettlementDays: integer('redemption_settlement_days'),
  reservationSettlementDays: integer('reservation_settlement_days'),
  redemptionCancelDays: integer('redemption_cancel_days'),
  minRedemptionQuantity: integer('min_redemption_quantity'),
  hasIof: boolean('has_iof').notNull().default(false),
  hasIr: boolean('has_ir').notNull().default(true),
  legacySgsId: integer('legacy_sgs_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  nameIdx: index('idx_investment_asset_groups_name').on(table.name),
}));
