import { pgTable, uuid, integer, numeric, timestamp } from 'drizzle-orm/pg-core';

// Tabela regressiva do IR por faixa de dias — dados estáticos
export const irRates = pgTable('ir_rates', {
  id: uuid('id').primaryKey().defaultRandom(),
  minDays: integer('min_days').notNull(),
  maxDays: integer('max_days'),   // NULL = sem limite superior (última faixa)
  ratePercentage: numeric('rate_percentage', { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
