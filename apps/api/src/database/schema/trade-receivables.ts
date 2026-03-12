import { pgTable, uuid, text, numeric, integer, date, timestamp, index } from 'drizzle-orm/pg-core';
import { clients } from './clients';
import { drawees } from './drawees';
import { cnabRemittanceFiles } from './cnab-remittance-files';
import { cnabOperations } from './cnab-operations';
import { portfolioPositions } from './portfolio-positions';

export const tradeReceivables = pgTable('trade_receivables', {
  id: uuid('id').primaryKey().defaultRandom(),

  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  draweeId: uuid('drawee_id').references(() => drawees.id, { onDelete: 'set null' }),
  cnabFileId: uuid('cnab_file_id').notNull().references(() => cnabRemittanceFiles.id, { onDelete: 'cascade' }),

  documentNumber: text('document_number'),
  ourNumber: text('our_number'),
  documentType: text('document_type'),
  speciesCode: text('species_code'),

  issueDate: date('issue_date'),
  dueDate: date('due_date'),

  faceValue: numeric('face_value', { precision: 18, scale: 4 }),
  interestPerDay: numeric('interest_per_day', { precision: 18, scale: 4 }),
  discountValue: numeric('discount_value', { precision: 18, scale: 4 }),
  discountDeadline: date('discount_deadline'),
  penaltyValue: numeric('penalty_value', { precision: 18, scale: 4 }),
  iofValue: numeric('iof_value', { precision: 18, scale: 4 }),

  acceptance: text('acceptance'),
  instruction1: text('instruction_1'),
  instruction2: text('instruction_2'),

  cedentDocType: text('cedent_doc_type'),
  cedentDoc: text('cedent_doc'),

  draweeDocType: text('drawee_doc_type'),
  draweeDoc: text('drawee_doc'),
  draweeName: text('drawee_name'),
  draweeAddress: text('drawee_address'),
  draweeNeighborhood: text('drawee_neighborhood'),
  draweeZip: text('drawee_zip'),
  draweeCity: text('drawee_city'),
  draweeState: text('drawee_state'),
  draweeEmail: text('drawee_email'),

  bankCode: text('bank_code'),
  branch: text('branch'),
  portfolioCode: text('portfolio_code'),

  status: text('status').notNull().default('pending'),
  operationId: uuid('operation_id').references(() => cnabOperations.id, { onDelete: 'set null' }),
  evaluationStatus: text('evaluation_status').notNull().default('pending'),
  rejectionReason: text('rejection_reason'),
  portfolioPositionId: uuid('portfolio_position_id').references(() => portfolioPositions.id, { onDelete: 'set null' }),
  cnabRecordSequence: integer('cnab_record_sequence'),
  rawLine: text('raw_line'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  clientDueDateIdx: index('idx_trade_receivables_client_due').on(table.clientId, table.dueDate),
  draweeStatusIdx: index('idx_trade_receivables_drawee_status').on(table.draweeId, table.status),
  cnabFileIdx: index('idx_trade_receivables_cnab_file').on(table.cnabFileId),
  operationIdx: index('idx_trade_receivables_operation').on(table.operationId),
  draweeDocIdx: index('idx_trade_receivables_drawee_doc').on(table.draweeDoc),
  docNumberClientIdx: index('idx_trade_receivables_doc_client').on(table.documentNumber, table.clientId),
}));
