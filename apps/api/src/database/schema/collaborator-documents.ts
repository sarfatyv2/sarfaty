import { pgTable, uuid, text, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { collaborators } from './collaborators';
import { profiles } from './profiles';

export const collaboratorDocuments = pgTable('collaborator_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  collaboratorId: uuid('collaborator_id').references(() => collaborators.id, { onDelete: 'cascade' }),
  documentType: text('document_type').notNull(),
  documentLabel: text('document_label'),
  storagePath: text('storage_path').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  uploadedBy: uuid('uploaded_by').notNull().references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  collaboratorIdx: index('idx_documents_collaborator').on(table.collaboratorId),
}));
