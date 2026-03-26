import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { upminerResults } from './upminer-results';

export const upminerEmpresaPj = pgTable(
  'upminer_empresa_pj',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    upminerResultId: uuid('upminer_result_id')
      .notNull()
      .references(() => upminerResults.id, { onDelete: 'cascade' }),

    cnpj: text('cnpj'),
    razaoSocial: text('razao_social'),
    nomeFantasia: text('nome_fantasia'),
    matriz: text('matriz'),
    dataAbertura: text('data_abertura'),
    situacaoCadastral: text('situacao_cadastral'),
    dataSituacao: text('data_situacao'),
    naturezaJuridicaCodigo: text('natureza_juridica_codigo'),
    naturezaJuridicaDescricao: text('natureza_juridica_descricao'),
    tipoCnae: text('tipo_cnae'),
    cnae: text('cnae'),
    cnaeSegmento: text('cnae_segmento'),
    cnaeDescricao: text('cnae_descricao'),
    dominio: text('dominio'),
    catchall: text('catchall'),
    optanteSimples: text('optante_simples'),
    numeroFiliais: integer('numero_filiais'),
    capitalSocial: numeric('capital_social', { precision: 18, scale: 2 }),
    porte: text('porte'),
    setor: text('setor'),
    faixaFuncionarios: text('faixa_funcionarios'),
    faturamentoAnualEstimado: text('faturamento_anual_estimado'),
    tipo: text('tipo'),
    tipoEstabelecimento: text('tipo_estabelecimento'),
    operacionalidade: text('operacionalidade'),
    motivoSituacao: text('motivo_situacao'),
    classeRisco: text('classe_risco'),
    ultimaAtualizacao: text('ultima_atualizacao'),
    dataConsulta: text('data_consulta'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_upminer_empresa_pj_result').on(table.upminerResultId),
    index('idx_upminer_empresa_pj_cnpj').on(table.cnpj),
  ],
);

export const upminerEmpresaPjEnderecos = pgTable(
  'upminer_empresa_pj_enderecos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    empresaPjId: uuid('empresa_pj_id')
      .notNull()
      .references(() => upminerEmpresaPj.id, { onDelete: 'cascade' }),
    bairro: text('bairro'),
    cidade: text('cidade'),
    uf: text('uf'),
    cep: text('cep'),
    ibge: text('ibge'),
    logradouroTipo: text('logradouro_tipo'),
    logradouroNumero: text('logradouro_numero'),
    logradouroComplemento: text('logradouro_complemento'),
    logradouro: text('logradouro'),
    latitude: numeric('latitude', { precision: 10, scale: 7 }),
    longitude: numeric('longitude', { precision: 10, scale: 7 }),
    ultimaAtualizacao: text('ultima_atualizacao'),
  },
  (table) => [
    index('idx_upminer_empresa_pj_enderecos_empresa').on(table.empresaPjId),
  ],
);

export const upminerEmpresaPjTelefones = pgTable(
  'upminer_empresa_pj_telefones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    empresaPjId: uuid('empresa_pj_id')
      .notNull()
      .references(() => upminerEmpresaPj.id, { onDelete: 'cascade' }),
    cnpj: text('cnpj'),
    apiId: text('api_id'),
    dataLog: text('data_log'),
    ddd: text('ddd'),
    descricao: text('descricao'),
    telefone: text('telefone'),
    telefoneComDdd: text('telefone_com_ddd'),
    rank: text('rank'),
  },
  (table) => [
    index('idx_upminer_empresa_pj_telefones_empresa').on(table.empresaPjId),
  ],
);

export const upminerEmpresaPjEmails = pgTable(
  'upminer_empresa_pj_emails',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    empresaPjId: uuid('empresa_pj_id')
      .notNull()
      .references(() => upminerEmpresaPj.id, { onDelete: 'cascade' }),
    enderecoEmail: text('endereco_email'),
    ultimaAtualizacao: text('ultima_atualizacao'),
  },
  (table) => [
    index('idx_upminer_empresa_pj_emails_empresa').on(table.empresaPjId),
  ],
);

export const upminerEmpresaPjSocios = pgTable(
  'upminer_empresa_pj_socios',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    empresaPjId: uuid('empresa_pj_id')
      .notNull()
      .references(() => upminerEmpresaPj.id, { onDelete: 'cascade' }),
    documentoSocio: text('documento_socio'),
    nome: text('nome'),
    tipoSocio: text('tipo_socio'),
    qualificacao: text('qualificacao'),
    participacao: numeric('participacao', { precision: 10, scale: 4 }),
    dataEntrada: text('data_entrada'),
    dataCad: text('data_cad'),
    dataAlt: text('data_alt'),
    ano: text('ano'),
  },
  (table) => [
    index('idx_upminer_empresa_pj_socios_empresa').on(table.empresaPjId),
    index('idx_upminer_empresa_pj_socios_documento').on(table.documentoSocio),
  ],
);

export const upminerEmpresaPjAtividadesSecundarias = pgTable(
  'upminer_empresa_pj_atividades_secundarias',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    empresaPjId: uuid('empresa_pj_id')
      .notNull()
      .references(() => upminerEmpresaPj.id, { onDelete: 'cascade' }),
    codigo: text('codigo'),
    descricao: text('descricao'),
  },
  (table) => [
    index('idx_upminer_empresa_pj_ativ_sec_empresa').on(table.empresaPjId),
  ],
);

export const upminerEmpresaPjSimplesNacional = pgTable(
  'upminer_empresa_pj_simples_nacional',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    empresaPjId: uuid('empresa_pj_id')
      .notNull()
      .references(() => upminerEmpresaPj.id, { onDelete: 'cascade' }),
    cnpj: text('cnpj'),
    dataConsulta: text('data_consulta'),
    statusSimplesNacional: text('status_simples_nacional'),
    statusSimei: text('status_simei'),
    dataSimplesNacional: text('data_simples_nacional'),
    dataSimei: text('data_simei'),
  },
  (table) => [
    index('idx_upminer_empresa_pj_simples_empresa').on(table.empresaPjId),
  ],
);
