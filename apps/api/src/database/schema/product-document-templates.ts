import { pgTable, uuid, text, boolean, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { creditProducts } from './credit-products';

export const productDocumentTemplates = pgTable('product_document_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => creditProducts.id, { onDelete: 'cascade' }),
  documentType: text('document_type').notNull(),
  documentLabel: text('document_label').notNull(),
  description: text('description'),
  isRequired: boolean('is_required').default(true),
  acceptedMimeTypes: text('accepted_mime_types').array().default(['application/pdf']),
  maxFileSizeMb: integer('max_file_size_mb').default(25),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  productIdx: index('idx_prod_doc_templates_product').on(table.productId),
}));
