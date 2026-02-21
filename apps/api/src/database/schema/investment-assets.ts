import { pgTable, uuid, text, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { investmentAssetGroups } from './investment-asset-groups';

export const investmentAssets = pgTable('investment_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  assetGroupId: uuid('asset_group_id').notNull().references(() => investmentAssetGroups.id),
  assetType: text('asset_type'),     // 'debenture' | 'cri' | 'cra' | 'other'
  yieldType: text('yield_type'),     // 'CDI' | 'IPCA' | 'fixed' | 'other'
  name: text('name').notNull(),

  // Overrides do grupo (null = herda do grupo)
  subscriptionCutoffTime: text('subscription_cutoff_time'),
  redemptionCutoffTime: text('redemption_cutoff_time'),
  redemptionSettlementDays: integer('redemption_settlement_days'),
  reservationSettlementDays: integer('reservation_settlement_days'),
  redemptionCancelDays: integer('redemption_cancel_days'),
  minRedemptionQuantity: integer('min_redemption_quantity'),
  hasIof: boolean('has_iof'),
  hasIr: boolean('has_ir'),

  legacySgsId: integer('legacy_sgs_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  groupIdx: index('idx_investment_assets_group').on(table.assetGroupId),
  typeIdx: index('idx_investment_assets_type').on(table.assetType),
}));
