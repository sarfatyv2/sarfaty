import { pgTable, uuid, text, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { upminerDossiers } from './upminer-dossiers';

/**
 * Unified hits table for sanction/blacklist sources.
 * One row per hit, method column discriminates the source:
 * ofacInstant, listaOnu, worldBank, baseOffshore,
 * informacaoJuridicaDocumento, TransparenciaBrasilCnep,
 * TransparenciaBrasilCeis, TransparenciaBrasilCepim, EmpresasPunidasSp
 *
 * Zero rows = clean (no hit found).
 */
export const upminerSancaoHits = pgTable(
  'upminer_sancao_hits',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    upminerDossierId: uuid('upminer_dossier_id')
      .notNull()
      .references(() => upminerDossiers.id, { onDelete: 'cascade' }),
    method: text('method').notNull(),
    nome: text('nome'),
    cpfCnpj: text('cpf_cnpj'),
    tipoSancao: text('tipo_sancao'),
    dataInicio: text('data_inicio'),
    dataFim: text('data_fim'),
    orgaoSancionador: text('orgao_sancionador'),
    fundamentacao: text('fundamentacao'),
    pais: text('pais'),
    observacao: text('observacao'),
  },
  (table) => [index('idx_upminer_sancao_hits_dossier_method').on(table.upminerDossierId, table.method)],
);

/**
 * SICAF — Cadastramento Unificado de Fornecedor
 * Returns a single status record per dossier.
 */
export const upminerSicaf = pgTable('upminer_sicaf', {
  id: uuid('id').primaryKey().defaultRandom(),
  upminerDossierId: uuid('upminer_dossier_id')
    .notNull()
    .unique()
    .references(() => upminerDossiers.id, { onDelete: 'cascade' }),
  cnpj: text('cnpj'),
  razaoSocial: text('razao_social'),
  nomeFantasia: text('nome_fantasia'),
  situacao: text('situacao'),
  situacaoCadastral: text('situacao_cadastral'),
});
