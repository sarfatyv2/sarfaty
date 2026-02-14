import { pgTable, serial, numeric, text } from 'drizzle-orm/pg-core';

export const rangeTenure = pgTable('range_tenure', {
  id: serial('id').primaryKey(),
  minYears: numeric('min_years', { precision: 4, scale: 1 }).notNull(),
  maxYears: numeric('max_years', { precision: 4, scale: 1 }),
  label: text('label').notNull(),
});
