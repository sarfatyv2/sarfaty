import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { faturamentoExtractions } from './faturamento-extractions';
import { clientDocuments } from './client-documents';

export const faturamentoExtractionSources = pgTable('faturamento_extraction_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  extractionId: uuid('extraction_id').notNull().references(() => faturamentoExtractions.id, { onDelete: 'cascade' }),
  documentId: uuid('document_id').notNull().references(() => clientDocuments.id, { onDelete: 'cascade' }),

  // SHA-256 of the original file — used for idempotency checks
  fileHash: text('file_hash'),

  pageCount: integer('page_count'),
  ocrApplied: boolean('ocr_applied').notNull().default(false),
  ocrQuality: numeric('ocr_quality', { precision: 5, scale: 2 }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_faturamento_sources_extraction').on(table.extractionId),
  index('idx_faturamento_sources_document').on(table.documentId),
  index('idx_faturamento_sources_hash').on(table.fileHash),
]);
