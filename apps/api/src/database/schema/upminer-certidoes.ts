import { pgTable, uuid, text, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { upminerDossiers } from './upminer-dossiers';

/**
 * One row per (dossier, method) for certidão-style sources:
 * MpfCertidaoNegativa, TcuCertidoesInidoneos, CertidaoTJDFT,
 * Tst, BancoDeFalenciasTst, CertidaoCadastroNacionalDeCondenacoesCiveis, CrdaPge
 */
export const upminerCertidoes = pgTable(
  'upminer_certidoes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    upminerDossierId: uuid('upminer_dossier_id')
      .notNull()
      .references(() => upminerDossiers.id, { onDelete: 'cascade' }),
    method: text('method').notNull(),
    nome: text('nome'),
    documento: text('documento'),
    conteudo: text('conteudo'),
    pdf: text('pdf'),
    dataEmissao: text('data_emissao'),
    dataValidade: text('data_validade'),
    certidaoNumero: text('certidao_numero'),
    seloDigital: text('selo_digital'),
  },
  (table) => [
    uniqueIndex('idx_upminer_certidoes_dossier_method').on(table.upminerDossierId, table.method),
  ],
);
