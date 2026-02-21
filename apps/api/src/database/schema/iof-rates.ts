import { pgTable, uuid, integer, numeric, timestamp } from 'drizzle-orm/pg-core';

// Tabela regressiva do IOF (0 a 30 dias) — dados estáticos
export const iofRates = pgTable('iof_rates', {
  id: uuid('id').primaryKey().defaultRandom(),
  elapsedDays: integer('elapsed_days').notNull().unique(),  // 0 a 30
  ratePercentage: numeric('rate_percentage', { precision: 5, scale: 4 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
