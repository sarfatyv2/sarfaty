import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { collaborators } from './collaborators';

export const collaboratorCltData = pgTable('collaborator_clt_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  collaboratorId: uuid('collaborator_id').unique().references(() => collaborators.id, { onDelete: 'cascade' }),
  ctpsNumber: text('ctps_number'),
  ctpsSeries: text('ctps_series'),
  pisPasep: text('pis_pasep'),
  timesheetSystem: text('timesheet_system').default('ponto_mais'),
  timesheetId: text('timesheet_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
