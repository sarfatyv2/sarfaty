import { pgTable, uuid, text, index } from 'drizzle-orm/pg-core';
import { upminerDossiers } from './upminer-dossiers';

// ─── Transparência Brasil: Contratos ──────────────────────────────────────────

export const upminerContratos = pgTable(
  'upminer_contratos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    upminerDossierId: uuid('upminer_dossier_id')
      .notNull()
      .references(() => upminerDossiers.id, { onDelete: 'cascade' }),
    apiId: text('api_id'),
    ano: text('ano'),
    mes: text('mes'),
    numeroContrato: text('numero_contrato'),
    objeto: text('objeto'),
    fundamentoLegal: text('fundamento_legal'),
    modalidadeCompra: text('modalidade_compra'),
    situacaoCompra: text('situacao_compra'),
    nomeOrgaoSuperior: text('nome_orgao_superior'),
    nomeOrgao: text('nome_orgao'),
    nomeUg: text('nome_ug'),
    assinaturaContrato: text('assinatura_contrato'),
    publicacaoDou: text('publicacao_dou'),
    inicioVigencia: text('inicio_vigencia'),
    fimVigencia: text('fim_vigencia'),
    cnpj: text('cnpj'),
    nomeEmpresa: text('nome_empresa'),
    valorInicial: text('valor_inicial'),
    valorFinal: text('valor_final'),
  },
  (table) => [index('idx_upminer_contratos_dossier').on(table.upminerDossierId)],
);

// ─── Google Global ────────────────────────────────────────────────────────────

export const upminerGoogleHits = pgTable(
  'upminer_google_hits',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    upminerDossierId: uuid('upminer_dossier_id')
      .notNull()
      .references(() => upminerDossiers.id, { onDelete: 'cascade' }),
    pais: text('pais'),
    criterio: text('criterio'),
    url: text('url'),
    titulo: text('titulo'),
    snippet: text('snippet'),
  },
  (table) => [index('idx_upminer_google_dossier').on(table.upminerDossierId)],
);
