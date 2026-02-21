import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { clients } from './clients';
import { clientAuthorizedPersons } from './client-authorized-persons';

export const vaduPersonResults = pgTable('vadu_person_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id),
  authorizedPersonId: uuid('authorized_person_id').references(() => clientAuthorizedPersons.id),
  
  cpf: text('cpf'),
  name: text('name'),
  birthDate: timestamp('birth_date'),
  motherName: text('mother_name'),
  
  rawData: jsonb('raw_data'),
  queriedAt: timestamp('queried_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  clientIdx: index('idx_vadu_person_results_client').on(table.clientId),
  personIdx: index('idx_vadu_person_results_person').on(table.authorizedPersonId),
  cpfIdx: index('idx_vadu_person_results_cpf').on(table.cpf),
}));
