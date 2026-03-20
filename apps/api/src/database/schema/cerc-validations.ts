import { pgTable, uuid, text, integer, numeric, date, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

export const cercValidations = pgTable('cerc_validations', {
  id: uuid('id').primaryKey().defaultRandom(),

  loteId: text('lote_id'),
  validacaoId: text('validacao_id'),
  veiculoId: text('veiculo_id').notNull(),
  numeroDuplicata: text('numero_duplicata').notNull(),
  chaveNfe: text('chave_nfe').notNull(),
  valor: numeric('valor', { precision: 15, scale: 2 }).notNull(),
  vencimento: date('vencimento').notNull(),
  cnpjCedente: text('cnpj_cedente').notNull(),
  cnpjCpfPagador: text('cnpj_cpf_pagador').notNull(),
  tipoPagador: text('tipo_pagador').notNull(),
  cnpjOriginador: text('cnpj_originador').notNull(),
  referenciaExterna: text('referencia_externa'),
  planodeCobranca: integer('plano_de_cobranca').notNull().default(6),

  status: text('status').notNull().default('PENDING'),
  statusProcessamento: text('status_processamento'),

  requestPayload: jsonb('request_payload'),
  validacaoData: jsonb('validacao_data'),
  constatacoesDados: jsonb('constatacoes_data'),
  eventosDados: jsonb('eventos_data'),
  partesDados: jsonb('partes_data'),
  docFiscalDados: jsonb('doc_fiscal_data'),

  errorMessage: text('error_message'),
  requestedAt: timestamp('requested_at', { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),

  requestedBy: uuid('requested_by'),
}, (table) => ({
  loteIdx: index('idx_cerc_validations_lote').on(table.loteId),
  validacaoIdx: index('idx_cerc_validations_validacao').on(table.validacaoId),
  statusIdx: index('idx_cerc_validations_status').on(table.status),
  requestedIdx: index('idx_cerc_validations_requested').on(table.requestedAt),
}));
