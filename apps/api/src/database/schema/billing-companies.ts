import { pgTable, uuid, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';

export const billingCompanies = pgTable(
  'billing_companies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    tradeName: text('trade_name'),
    cnpj: text('cnpj').notNull().unique(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    cnpjIdx: index('idx_billing_companies_cnpj').on(table.cnpj),
    activeIdx: index('idx_billing_companies_active').on(table.isActive),
  }),
);
