import { pgTable, uuid, text, integer, numeric, date, timestamp, index, foreignKey, unique } from 'drizzle-orm/pg-core';

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

export const cercValidationResultados = pgTable('cerc_validation_resultados', {
  id: uuid('id').primaryKey().defaultRandom(),

  cercValidationId: uuid('cerc_validation_id').notNull(),

  resultadoCercId: text('resultado_cerc_id').notNull(),
  codigo: text('codigo'),

  algoritmoId: text('algoritmo_id'),
  algoritmoCodigo: text('algoritmo_codigo'),
  algoritmoNome: text('algoritmo_nome'),
  algoritmoTipo: text('algoritmo_tipo').notNull(),
  algoritmoDimensao: text('algoritmo_dimensao').notNull(),
  algoritmoEscopo: text('algoritmo_escopo').notNull(),

  mensagem: text('mensagem').notNull(),
  impacto: text('impacto').notNull(),

  dadosUtilizados: text('dados_utilizados'),
  parametrosDoAlgoritmo: text('parametros_do_algoritmo'),
  informacoesComplementares: text('informacoes_complementares'),

  dataConclusao: timestamp('data_conclusao', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  cercValidationFk: foreignKey({
    columns: [table.cercValidationId],
    foreignColumns: [cercValidations.id],
  }).onDelete('cascade'),
  cercValidationIdx: index('idx_cerc_resultados_validation').on(table.cercValidationId),
  impactoIdx: index('idx_cerc_resultados_impacto').on(table.impacto),
  dimensaoIdx: index('idx_cerc_resultados_dimensao').on(table.algoritmoDimensao),
  tipoIdx: index('idx_cerc_resultados_tipo').on(table.algoritmoTipo),
}));

export const cercValidationEventos = pgTable('cerc_validation_eventos', {
  id: uuid('id').primaryKey().defaultRandom(),
  cercValidationId: uuid('cerc_validation_id').notNull(),
  data: timestamp('data', { withTimezone: true }).notNull(),
  codigo: text('codigo').notNull(),
  descricao: text('descricao'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  cercValidationFk: foreignKey({
    columns: [table.cercValidationId],
    foreignColumns: [cercValidations.id],
  }).onDelete('cascade'),
  cercValidationIdx: index('idx_cerc_eventos_validation').on(table.cercValidationId),
}));

export const cercValidationPartes = pgTable('cerc_validation_partes', {
  id: uuid('id').primaryKey().defaultRandom(),
  cercValidationId: uuid('cerc_validation_id').notNull(),
  role: text('role').notNull(),
  documentoTipo: text('documento_tipo').notNull(),
  documentoNumero: text('documento_numero').notNull(),
  razaoSocial: text('razao_social'),
  nomeFantasia: text('nome_fantasia'),
  uf: text('uf'),
  cep: text('cep'),
  municipio: text('municipio'),
  dataDeAbertura: date('data_de_abertura'),
  capitalSocial: numeric('capital_social', { precision: 20, scale: 2 }),
  situacaoCadastralStatus: text('situacao_cadastral_status'),
  atividadePrincipalCodigo: text('atividade_principal_codigo'),
  atividadePrincipalDescricao: text('atividade_principal_descricao'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  cercValidationFk: foreignKey({
    columns: [table.cercValidationId],
    foreignColumns: [cercValidations.id],
  }).onDelete('cascade'),
  cercValidationIdx: index('idx_cerc_partes_validation').on(table.cercValidationId),
  roleIdx: index('idx_cerc_partes_role').on(table.role),
}));

export const cercValidationDocFiscal = pgTable('cerc_validation_doc_fiscal', {
  id: uuid('id').primaryKey().defaultRandom(),
  cercValidationId: uuid('cerc_validation_id').notNull(),
  tipo: text('tipo').notNull(),
  chaveAcesso: text('chave_acesso'),
  numero: text('numero'),
  serie: text('serie'),
  modelo: text('modelo'),
  situacao: text('situacao'),
  naturezaOperacao: text('natureza_operacao'),
  dataEmissao: timestamp('data_emissao', { withTimezone: true }),
  valorTotal: numeric('valor_total', { precision: 15, scale: 2 }),
  emitenteNome: text('emitente_nome'),
  emitenteCnpj: text('emitente_cnpj'),
  emitenteUf: text('emitente_uf'),
  destinatarioNome: text('destinatario_nome'),
  destinatarioCnpj: text('destinatario_cnpj'),
  destinatarioCpf: text('destinatario_cpf'),
  destinatarioUf: text('destinatario_uf'),
  faturaNumero: text('fatura_numero'),
  faturaValorOriginal: numeric('fatura_valor_original', { precision: 15, scale: 2 }),
  faturaValorLiquido: numeric('fatura_valor_liquido', { precision: 15, scale: 2 }),
  modalidadeFrete: text('modalidade_frete'),
  transportadorNome: text('transportador_nome'),
  transportadorCnpj: text('transportador_cnpj'),
  valorIcms: numeric('valor_icms', { precision: 15, scale: 2 }),
  valorPis: numeric('valor_pis', { precision: 15, scale: 2 }),
  valorCofins: numeric('valor_cofins', { precision: 15, scale: 2 }),
  valorProdutos: numeric('valor_produtos', { precision: 15, scale: 2 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  cercValidationFk: foreignKey({
    columns: [table.cercValidationId],
    foreignColumns: [cercValidations.id],
  }).onDelete('cascade'),
  uniqueValidation: unique('uq_cerc_doc_fiscal_validation').on(table.cercValidationId),
}));

export const cercValidationNfeDuplicatas = pgTable('cerc_validation_nfe_duplicatas', {
  id: uuid('id').primaryKey().defaultRandom(),
  cercValidationId: uuid('cerc_validation_id').notNull(),
  numero: text('numero').notNull(),
  valor: numeric('valor', { precision: 15, scale: 2 }),
  vencimento: date('vencimento'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  cercValidationFk: foreignKey({
    columns: [table.cercValidationId],
    foreignColumns: [cercValidations.id],
  }).onDelete('cascade'),
  cercValidationIdx: index('idx_cerc_nfe_duplicatas_validation').on(table.cercValidationId),
}));

export const cercValidationNfeProdutos = pgTable('cerc_validation_nfe_produtos', {
  id: uuid('id').primaryKey().defaultRandom(),
  cercValidationId: uuid('cerc_validation_id').notNull(),
  num: text('num').notNull(),
  codigo: text('codigo'),
  descricao: text('descricao').notNull(),
  ncm: text('ncm'),
  cfop: text('cfop'),
  unidade: text('unidade'),
  quantidade: numeric('quantidade', { precision: 15, scale: 4 }),
  valorUnitario: numeric('valor_unitario', { precision: 15, scale: 4 }),
  valorTotal: numeric('valor_total', { precision: 15, scale: 2 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  cercValidationFk: foreignKey({
    columns: [table.cercValidationId],
    foreignColumns: [cercValidations.id],
  }).onDelete('cascade'),
  cercValidationIdx: index('idx_cerc_nfe_produtos_validation').on(table.cercValidationId),
}));

export const cercValidationNfeEventosFiscais = pgTable('cerc_validation_nfe_eventos_fiscais', {
  id: uuid('id').primaryKey().defaultRandom(),
  cercValidationId: uuid('cerc_validation_id').notNull(),
  tipo: text('tipo'),
  data: timestamp('data', { withTimezone: true }),
  orgao: text('orgao'),
  protocolo: text('protocolo'),
  evento: text('evento'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  cercValidationFk: foreignKey({
    columns: [table.cercValidationId],
    foreignColumns: [cercValidations.id],
  }).onDelete('cascade'),
  cercValidationIdx: index('idx_cerc_nfe_eventos_fiscais_validation').on(table.cercValidationId),
}));
