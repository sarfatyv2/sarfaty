import { pgTable, uuid, text, numeric, date, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { clients } from './clients';

export const portfolioPositions = pgTable('portfolio_positions', {
  id: uuid('id').primaryKey().defaultRandom(),
  fundName: text('fund_name').notNull(),   // 'hemera' | 'singulare' | outro
  fundCnpj: text('fund_cnpj'),
  positionDate: date('position_date').notNull(),

  // Entidades conhecidas (nullable — preenchidos após migração)
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
  // drawee_id: FK adicionada via migration após drawees existir (já foi criada no Sprint B)
  draweeId: uuid('drawee_id'),

  // Fallbacks para entidades ainda não migradas
  cedentDoc: text('cedent_doc'),
  draweeDoc: text('drawee_doc'),
  cedentName: text('cedent_name'),
  draweeName: text('drawee_name'),

  // Ativo
  assetType: text('asset_type'),      // 'duplicate' | 'ccb' | 'nfe' | 'check'
  assetSubtype: text('asset_subtype'),
  documentNumber: text('document_number'),
  titleIdExternal: text('title_id_external'),   // ID no sistema externo (Vadu/Vx)

  // Datas
  emissionDate: date('emission_date'),
  acquisitionDate: date('acquisition_date'),
  originalMaturity: date('original_maturity'),
  adjustedMaturity: date('adjusted_maturity'),
  extensionDate: date('extension_date'),

  // Valores
  nominalValue: numeric('nominal_value', { precision: 18, scale: 4 }).notNull(),
  acquisitionValue: numeric('acquisition_value', { precision: 18, scale: 4 }),
  currentNominal: numeric('current_nominal', { precision: 18, scale: 4 }),
  presentValue: numeric('present_value', { precision: 18, scale: 4 }),
  mtmValue: numeric('mtm_value', { precision: 18, scale: 4 }),

  // Risco / PDD
  pddNote: text('pdd_note'),            // 'AA' | 'A' | 'B' | 'C' | 'D' | 'E'
  pddRatingValue: numeric('pdd_rating_value', { precision: 18, scale: 4 }),
  pddOverdueValue: numeric('pdd_overdue_value', { precision: 18, scale: 4 }),

  // Status e flags
  status: text('status'),               // 'current' | 'overdue' | 'settled' | 'default'
  hasCoobligation: boolean('has_coobligation').notNull().default(false),
  originadorDoc: text('originador_doc'),
  cnae: text('cnae'),
  sourceFile: text('source_file'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  fundDateIdx: index('idx_portfolio_positions_fund_date').on(table.fundName, table.positionDate),
  draweeDocIdx: index('idx_portfolio_positions_drawee_doc').on(table.draweeDoc, table.positionDate),
  cedentDocIdx: index('idx_portfolio_positions_cedent_doc').on(table.cedentDoc, table.positionDate),
  clientIdx: index('idx_portfolio_positions_client').on(table.clientId),
  statusIdx: index('idx_portfolio_positions_status').on(table.status),
}));
