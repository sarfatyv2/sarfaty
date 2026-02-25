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
import { irpfExtractions } from './irpf-extractions';
import { clientDocuments } from './client-documents';

export const irpfExtractionSources = pgTable('irpf_extraction_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  extractionId: uuid('extraction_id').notNull().references(() => irpfExtractions.id, { onDelete: 'cascade' }),
  documentId: uuid('document_id').notNull().references(() => clientDocuments.id, { onDelete: 'cascade' }),

  // 'receipt' | 'declaration' | 'unknown'
  documentSubtype: text('document_subtype').notNull().default('unknown'),

  // SHA-256 of the original file — used for idempotency checks
  fileHash: text('file_hash'),

  pageCount: integer('page_count'),
  ocrApplied: boolean('ocr_applied').notNull().default(false),
  ocrQuality: numeric('ocr_quality', { precision: 5, scale: 2 }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('idx_irpf_sources_extraction').on(table.extractionId),
  index('idx_irpf_sources_document').on(table.documentId),
  index('idx_irpf_sources_hash').on(table.fileHash),
]);
