import { pgTable, uuid, text, integer, boolean, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { upminerResults } from './upminer-results';

export const upminerDossiers = pgTable(
  'upminer_dossiers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    upminerResultId: uuid('upminer_result_id')
      .notNull()
      .references(() => upminerResults.id, { onDelete: 'cascade' }),
    apiDossierId: integer('api_dossier_id').notNull(),
    criterionInput: text('criterion_input').notNull(),
    criterionName: text('criterion_name'),
    dossierStatus: text('dossier_status'),
    dossierState: text('dossier_state'),
    hasUpflag: boolean('has_upflag').notNull().default(false),
    searchProfileName: text('search_profile_name'),
    homonyms: integer('homonyms'),
    apiBatchId: integer('api_batch_id'),
    apiUserId: integer('api_user_id'),
    apiUserName: text('api_user_name'),
    createdAtApi: text('created_at_api'),
    processedAtApi: text('processed_at_api'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique('upminer_dossiers_result_api_unique').on(table.upminerResultId, table.apiDossierId),
    index('idx_upminer_dossiers_result').on(table.upminerResultId),
    index('idx_upminer_dossiers_api_id').on(table.apiDossierId),
  ],
);

export const upminerDossierSources = pgTable(
  'upminer_dossier_sources',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    upminerDossierId: uuid('upminer_dossier_id')
      .notNull()
      .references(() => upminerDossiers.id, { onDelete: 'cascade' }),
    method: text('method').notNull(),
    name: text('name'),
    hasResult: boolean('has_result').notNull().default(false),
    processedStatus: text('processed_status'),
    processedAtApi: text('processed_at_api'),
  },
  (table) => [
    unique('upminer_dossier_sources_dossier_method_unique').on(table.upminerDossierId, table.method),
    index('idx_upminer_dossier_sources_dossier').on(table.upminerDossierId),
  ],
);
