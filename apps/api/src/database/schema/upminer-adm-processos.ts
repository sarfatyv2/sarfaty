import { pgTable, uuid, text, index } from 'drizzle-orm/pg-core';
import { upminerDossiers } from './upminer-dossiers';

// ─── MPF: Andamento de Processos ──────────────────────────────────────────────

export const upminerMpfProcessos = pgTable(
  'upminer_mpf_processos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    upminerDossierId: uuid('upminer_dossier_id')
      .notNull()
      .references(() => upminerDossiers.id, { onDelete: 'cascade' }),
    apiId: text('api_id'),
    nome: text('nome'),
    estado: text('estado'),
  },
  (table) => [index('idx_upminer_mpf_proc_dossier').on(table.upminerDossierId)],
);

export const upminerMpfProcessoDetalhes = pgTable(
  'upminer_mpf_processo_detalhes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    mpfProcessoId: uuid('mpf_processo_id')
      .notNull()
      .references(() => upminerMpfProcessos.id, { onDelete: 'cascade' }),
    numProcesso: text('num_processo'),
    partes: text('partes').array(),
    orgaoPoder: text('orgao_poder'),
    vara: text('vara'),
    localizacaoAtual: text('localizacao_atual'),
    classe: text('classe'),
    camara: text('camara'),
    dataAutuacao: text('data_autuacao'),
    assunto: text('assunto'),
    distribuicao: text('distribuicao'),
  },
  (table) => [index('idx_upminer_mpf_det_proc').on(table.mpfProcessoId)],
);

// ─── CNJ: DJEN — Diário de Justiça Eletrônico Nacional ────────────────────────

export const upminerDjenCitacoes = pgTable(
  'upminer_djen_citacoes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    upminerDossierId: uuid('upminer_dossier_id')
      .notNull()
      .references(() => upminerDossiers.id, { onDelete: 'cascade' }),
    apiId: text('api_id'),
    estado: text('estado'),
    data: text('data'),
    sigla: text('sigla'),
    tipoComunicacao: text('tipo_comunicacao'),
    nomeOrgao: text('nome_orgao'),
    tipoDocumento: text('tipo_documento'),
    nomeClasse: text('nome_classe'),
    numeroProcesso: text('numero_processo'),
    numeroProcessoMascara: text('numero_processo_mascara'),
    link: text('link'),
    texto: text('texto'),
  },
  (table) => [index('idx_upminer_djen_dossier').on(table.upminerDossierId)],
);

export const upminerDjenDestinatarios = pgTable(
  'upminer_djen_destinatarios',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    djenCitacaoId: uuid('djen_citacao_id')
      .notNull()
      .references(() => upminerDjenCitacoes.id, { onDelete: 'cascade' }),
    nome: text('nome'),
    tipoDestinatario: text('tipo_destinatario'),
    numeroOab: text('numero_oab'),
    ufOab: text('uf_oab'),
  },
  (table) => [index('idx_upminer_djen_dest').on(table.djenCitacaoId)],
);

// ─── PROCON SP ────────────────────────────────────────────────────────────────

export const upminerProconAnos = pgTable(
  'upminer_procon_anos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    upminerDossierId: uuid('upminer_dossier_id')
      .notNull()
      .references(() => upminerDossiers.id, { onDelete: 'cascade' }),
    nomeFantasia: text('nome_fantasia'),
    razaoSocial: text('razao_social'),
    ano: text('ano'),
  },
  (table) => [index('idx_upminer_procon_dossier').on(table.upminerDossierId)],
);

export const upminerProconReclamacoes = pgTable(
  'upminer_procon_reclamacoes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    proconAnoId: uuid('procon_ano_id')
      .notNull()
      .references(() => upminerProconAnos.id, { onDelete: 'cascade' }),
    descricao: text('descricao'),
    atendida: text('atendida'),
    naoAtendida: text('nao_atendida'),
  },
  (table) => [index('idx_upminer_procon_rec').on(table.proconAnoId)],
);

// ─── Reclame Aqui ─────────────────────────────────────────────────────────────

export const upminerReclameAqui = pgTable('upminer_reclame_aqui', {
  id: uuid('id').primaryKey().defaultRandom(),
  upminerDossierId: uuid('upminer_dossier_id')
    .notNull()
    .unique()
    .references(() => upminerDossiers.id, { onDelete: 'cascade' }),
  empresa: text('empresa'),
  dataCadastro: text('data_cadastro'),
  site: text('site'),
  telefone: text('telefone'),
  classificacao: text('classificacao'),
  atendidas: text('atendidas'),
  solucao: text('solucao'),
  voltaria: text('voltaria'),
  notaConsumidor: text('nota_consumidor'),
  tempoMedioResposta: text('tempo_medio_resposta'),
  totalAtendidas: text('total_atendidas'),
  totalNaoAtendidas: text('total_nao_atendidas'),
  totalReclamacoes: text('total_reclamacoes'),
});

export const upminerReclameAquiReclamacoes = pgTable(
  'upminer_reclame_aqui_reclamacoes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reclameAquiId: uuid('reclame_aqui_id')
      .notNull()
      .references(() => upminerReclameAqui.id, { onDelete: 'cascade' }),
    texto: text('texto'),
  },
  (table) => [index('idx_upminer_reclame_rec').on(table.reclameAquiId)],
);

// ─── Banco Central: CRSFN ─────────────────────────────────────────────────────

export const upminerCrsfnAcoes = pgTable(
  'upminer_crsfn_acoes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    upminerDossierId: uuid('upminer_dossier_id')
      .notNull()
      .references(() => upminerDossiers.id, { onDelete: 'cascade' }),
    processo: text('processo'),
    ementa: text('ementa'),
    dataJulgamento: text('data_julgamento'),
    resultado: text('resultado'),
    relator: text('relator'),
    recurso: text('recurso'),
  },
  (table) => [index('idx_upminer_crsfn_dossier').on(table.upminerDossierId)],
);

// ─── TCU: Processos Resumido ──────────────────────────────────────────────────

export const upminerTcuProcessos = pgTable(
  'upminer_tcu_processos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    upminerDossierId: uuid('upminer_dossier_id')
      .notNull()
      .references(() => upminerDossiers.id, { onDelete: 'cascade' }),
    numProcesso: text('num_processo'),
    tipo: text('tipo'),
    assunto: text('assunto'),
    situacao: text('situacao'),
    orgao: text('orgao'),
    acordao: text('acordao'),
    dataAcordao: text('data_acordao'),
  },
  (table) => [index('idx_upminer_tcu_proc_dossier').on(table.upminerDossierId)],
);
