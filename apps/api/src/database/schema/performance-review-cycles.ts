import { pgTable, uuid, text, date, timestamp } from 'drizzle-orm/pg-core';

export const performanceReviewCycles = pgTable('performance_review_cycles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  status: text('status').notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
