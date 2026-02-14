import { pgTable, serial, integer, text } from 'drizzle-orm/pg-core';

export const rangeAge = pgTable('range_age', {
  id: serial('id').primaryKey(),
  minAge: integer('min_age').notNull(),
  maxAge: integer('max_age'),
  label: text('label').notNull(),
});
