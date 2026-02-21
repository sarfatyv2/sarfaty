import { pgTable, uuid, text, date, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { drawees } from './drawees';
import { creditProducts } from './credit-products';

export const draweeEnabledProducts = pgTable('drawee_enabled_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  draweeId: uuid('drawee_id').notNull().references(() => drawees.id, { onDelete: 'cascade' }),
  creditProductId: uuid('credit_product_id').notNull().references(() => creditProducts.id),
  enabledAt: date('enabled_at'),
  disabledAt: date('disabled_at'),
  disabledReason: text('disabled_reason'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  draweeIdx: index('idx_drawee_enabled_products_drawee').on(table.draweeId),
  productIdx: index('idx_drawee_enabled_products_product').on(table.creditProductId),
  activeIdx: index('idx_drawee_enabled_products_active').on(table.isActive),
}));
