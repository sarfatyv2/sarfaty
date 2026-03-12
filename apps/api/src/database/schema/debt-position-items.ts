import {
  pgTable,
  uuid,
  text,
  boolean,
  numeric,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { clients } from './clients';
import { clientDocuments } from './client-documents';

export const debtPositionItems = pgTable('debt_position_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  documentId: uuid('document_id').references(() => clientDocuments.id, { onDelete: 'set null' }),

  institution: text('institution').notNull(),
  modality: text('modality'),
  guarantee: text('guarantee'),
  guaranteePercentage: numeric('guarantee_percentage', { precision: 5, scale: 2 }),
  value: numeric('value', { precision: 18, scale: 2 }).notNull(),
  notes: text('notes'),

  source: text('source').notNull().default('manual'),
  // 'ai' | 'manual'
  extractionConfidence: text('extraction_confidence'),
  // 'high' | 'medium' | 'low'

  isAiGenerated: boolean('is_ai_generated').notNull().default(false),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_debt_position_items_client').on(table.clientId),
  index('idx_debt_position_items_document').on(table.documentId),
  index('idx_debt_position_items_source').on(table.source),
]);
