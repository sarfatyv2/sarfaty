import { pgTable, uuid, text, numeric, date, timestamp, index, unique } from 'drizzle-orm/pg-core';

export const marketRates = pgTable('market_rates', {
  id: uuid('id').primaryKey().defaultRandom(),
  rateType: text('rate_type').notNull(),   // 'DI' | 'SELIC' | 'other'
  rateDate: date('rate_date').notNull(),
  value: numeric('value', { precision: 18, scale: 6 }).notNull(),
  source: text('source').notNull().default('B3'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  rateTypeUnique: unique('uq_market_rates').on(table.rateType, table.rateDate),
  typeIdx: index('idx_market_rates_type').on(table.rateType),
  dateIdx: index('idx_market_rates_date').on(table.rateDate),
}));
