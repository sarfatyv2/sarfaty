import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  numeric,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { upminerResults } from './upminer-results';

export const upminerProcessos = pgTable(
  'upminer_processos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    upminerResultId: uuid('upminer_result_id')
      .notNull()
      .references(() => upminerResults.id, { onDelete: 'cascade' }),

    // Identificação
    apiProcessoId: text('api_processo_id'),
    urlProcesso: text('url_processo'),
    numeroProcessoUnico: text('numero_processo_unico'),
    numeroProcessoAntigo: text('numero_processo_antigo'),

    // Dados básicos
    statusObservacao: text('status_observacao'),
    juiz: text('juiz'),
    relator: text('relator'),
    orgaoJulgador: text('orgao_julgador'),
    unidadeOrigem: text('unidade_origem'),
    grauProcesso: integer('grau_processo'),
    area: text('area'),
    sistema: text('sistema'),
    segmento: text('segmento'),
    tribunalOrigem: text('tribunal_origem'),
    uf: text('uf'),
    tribunal: text('tribunal'),

    // Datas
    dataDistribuicao: timestamp('data_distribuicao'),
    dataProcessamento: timestamp('data_processamento'),
    dataAutuacao: timestamp('data_autuacao'),

    // Valor da causa
    valorCausaMoeda: text('valor_causa_moeda'),
    valorCausaValor: numeric('valor_causa_valor', { precision: 18, scale: 2 }),

    // Classe processual (inline)
    classeProcessualNome: text('classe_processual_nome'),
    classeProcessualCodigoCnj: text('classe_processual_codigo_cnj'),

    // Flags booleanas
    eTutelaAntecipada: boolean('e_tutela_antecipada'),
    temInjuncao: boolean('tem_injuncao'),
    eJusticaGratuita: boolean('e_justica_gratuita'),
    ePrioritario: boolean('e_prioritario'),
    eSegredoJustica: boolean('e_segredo_justica'),
    eProcessoDigital: boolean('e_processo_digital'),
    temAcordao: boolean('tem_acordao'),
    temSentenca: boolean('tem_sentenca'),

    // Status Predictus (inline — julgamentos e penhoras em tabelas próprias)
    statusPredictusStatusProcesso: text('status_predictus_status_processo'),
    statusPredictusRamoDireito: text('status_predictus_ramo_direito'),
    statusPredictusJusticaGratuita: text('status_predictus_justica_gratuita'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_upminer_processos_result').on(table.upminerResultId),
    index('idx_upminer_processos_numero').on(table.numeroProcessoUnico),
    index('idx_upminer_processos_tribunal').on(table.tribunal),
  ],
);

export const upminerProcessoAssuntosCnj = pgTable(
  'upminer_processo_assuntos_cnj',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    processoId: uuid('processo_id')
      .notNull()
      .references(() => upminerProcessos.id, { onDelete: 'cascade' }),
    titulo: text('titulo'),
    codigoCnj: text('codigo_cnj'),
    ePrincipal: boolean('e_principal'),
  },
  (table) => [
    index('idx_upminer_assuntos_processo').on(table.processoId),
  ],
);

export const upminerProcessoPartes = pgTable(
  'upminer_processo_partes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    processoId: uuid('processo_id')
      .notNull()
      .references(() => upminerProcessos.id, { onDelete: 'cascade' }),
    tipo: text('tipo'),
    nome: text('nome'),
    polo: text('polo'),
    cpf: text('cpf'),
    cnpj: text('cnpj'),
    cnpjRaiz: text('cnpj_raiz'),
    origemDocumento: text('origem_documento'),
    dataAtualizacao: text('data_atualizacao'),
  },
  (table) => [
    index('idx_upminer_partes_processo').on(table.processoId),
    index('idx_upminer_partes_cnpj').on(table.cnpj),
    index('idx_upminer_partes_cpf').on(table.cpf),
  ],
);

export const upminerProcessoAdvogados = pgTable(
  'upminer_processo_advogados',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    parteId: uuid('parte_id')
      .notNull()
      .references(() => upminerProcessoPartes.id, { onDelete: 'cascade' }),
    tipo: text('tipo'),
    nome: text('nome'),
    cpf: text('cpf'),
    oabUf: text('oab_uf'),
    oabNumero: integer('oab_numero'),
    oabTipo: text('oab_tipo'),
    dataAtualizacao: text('data_atualizacao'),
  },
  (table) => [
    index('idx_upminer_advogados_parte').on(table.parteId),
  ],
);

export const upminerProcessoMovimentos = pgTable(
  'upminer_processo_movimentos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    processoId: uuid('processo_id')
      .notNull()
      .references(() => upminerProcessos.id, { onDelete: 'cascade' }),
    indice: integer('indice'),
    nomeOriginal: text('nome_original').array(),
    classificacaoCnjCodigo: text('classificacao_cnj_codigo'),
    classificacaoCnjNome: text('classificacao_cnj_nome'),
    data: timestamp('data'),
  },
  (table) => [
    index('idx_upminer_movimentos_processo').on(table.processoId),
  ],
);

export const upminerProcessoRelacionados = pgTable(
  'upminer_processo_relacionados',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    processoId: uuid('processo_id')
      .notNull()
      .references(() => upminerProcessos.id, { onDelete: 'cascade' }),
    numeroProcesso: text('numero_processo'),
  },
  (table) => [
    index('idx_upminer_relacionados_processo').on(table.processoId),
  ],
);

export const upminerProcessoJulgamentos = pgTable(
  'upminer_processo_julgamentos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    processoId: uuid('processo_id')
      .notNull()
      .references(() => upminerProcessos.id, { onDelete: 'cascade' }),
    dataJulgamento: timestamp('data_julgamento'),
    statusJulgamento: text('status_julgamento'),
    diasAteJulgamento: integer('dias_ate_julgamento'),
    tipoJulgamento: text('tipo_julgamento'),
  },
  (table) => [
    index('idx_upminer_julgamentos_processo').on(table.processoId),
  ],
);

export const upminerProcessoPenhoras = pgTable(
  'upminer_processo_penhoras',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    processoId: uuid('processo_id')
      .notNull()
      .references(() => upminerProcessos.id, { onDelete: 'cascade' }),
    data: timestamp('data'),
    tipo: text('tipo'),
    trechoDecisao: text('trecho_decisao'),
  },
  (table) => [
    index('idx_upminer_penhoras_processo').on(table.processoId),
  ],
);
