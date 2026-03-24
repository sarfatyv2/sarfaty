import { pgTable, uuid, text, smallint, index } from 'drizzle-orm/pg-core';
import { upminerDossiers } from './upminer-dossiers';

export const upminerReceitaFederalPj = pgTable('upminer_receita_federal_pj', {
  id: uuid('id').primaryKey().defaultRandom(),
  upminerDossierId: uuid('upminer_dossier_id')
    .notNull()
    .unique()
    .references(() => upminerDossiers.id, { onDelete: 'cascade' }),
  cnpj: text('cnpj'),
  tipo: text('tipo'),
  dataAbertura: text('data_abertura'),
  nomeEmpresarial: text('nome_empresarial'),
  nomeFantasia: text('nome_fantasia'),
  atividadeEconomicaPrincipal: text('atividade_economica_principal'),
});

export const upminerReceitaSecundarias = pgTable(
  'upminer_receita_secundarias',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    receitaFederalPjId: uuid('receita_federal_pj_id')
      .notNull()
      .references(() => upminerReceitaFederalPj.id, { onDelete: 'cascade' }),
    codigo: text('codigo'),
    descricao: text('descricao'),
    ordem: smallint('ordem').notNull().default(0),
  },
  (table) => [index('idx_upminer_receita_sec').on(table.receitaFederalPjId)],
);

export const upminerQsa = pgTable('upminer_qsa', {
  id: uuid('id').primaryKey().defaultRandom(),
  upminerDossierId: uuid('upminer_dossier_id')
    .notNull()
    .unique()
    .references(() => upminerDossiers.id, { onDelete: 'cascade' }),
  cnpj: text('cnpj'),
  razaoSocial: text('razao_social'),
  capitalSocial: text('capital_social'),
  dataConsulta: text('data_consulta'),
  pep: text('pep'),
});

export const upminerQsaSocios = pgTable(
  'upminer_qsa_socios',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    upminerQsaId: uuid('upminer_qsa_id')
      .notNull()
      .references(() => upminerQsa.id, { onDelete: 'cascade' }),
    cpfCnpj: text('cpf_cnpj'),
    nome: text('nome'),
    entrada: text('entrada'),
    qualificacao: text('qualificacao'),
    participacao: text('participacao'),
    situacao: text('situacao'),
    pep: text('pep'),
    tipoSocio: text('tipo_socio'),
  },
  (table) => [index('idx_upminer_qsa_socios_qsa').on(table.upminerQsaId)],
);

export const upminerCadeProcessos = pgTable(
  'upminer_cade_processos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    upminerDossierId: uuid('upminer_dossier_id')
      .notNull()
      .references(() => upminerDossiers.id, { onDelete: 'cascade' }),
    apiRowId: text('api_row_id'),
    estado: text('estado'),
    processo: text('processo'),
    tipo: text('tipo'),
    dataRegistro: text('data_registro'),
    resumoInt: text('resumo_int'),
    interessados: text('interessados').array(),
  },
  (table) => [index('idx_upminer_cade_dossier').on(table.upminerDossierId)],
);

export const upminerCadeProtocolos = pgTable(
  'upminer_cade_protocolos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cadeProcessoId: uuid('cade_processo_id')
      .notNull()
      .references(() => upminerCadeProcessos.id, { onDelete: 'cascade' }),
    docProcesso: text('doc_processo'),
    tipoDoc: text('tipo_doc'),
    dataDocumento: text('data_documento'),
    dataRegistro: text('data_registro'),
    unidade: text('unidade'),
    linkPdf: text('link_pdf'),
  },
  (table) => [index('idx_upminer_cade_proto_processo').on(table.cadeProcessoId)],
);

export const upminerCadeAndamentos = pgTable(
  'upminer_cade_andamentos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cadeProcessoId: uuid('cade_processo_id')
      .notNull()
      .references(() => upminerCadeProcessos.id, { onDelete: 'cascade' }),
    dataHora: text('data_hora'),
    unidade: text('unidade'),
    descricao: text('descricao'),
  },
  (table) => [index('idx_upminer_cade_and_processo').on(table.cadeProcessoId)],
);
