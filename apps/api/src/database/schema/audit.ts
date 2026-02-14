import { pgTable, uuid, text, jsonb, timestamp, index } from 'drizzle-orm/pg-core';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  correlationId: text('correlation_id').notNull(),
  actorId: uuid('actor_id').notNull(),
  actorRole: text('actor_role').notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  httpMethod: text('http_method').notNull(),
  path: text('path').notNull(),
  payload: jsonb('payload'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  entityIdx: index('idx_audit_logs_entity').on(table.entityType, table.entityId),
  actorIdx: index('idx_audit_logs_actor').on(table.actorId),
  actionIdx: index('idx_audit_logs_action').on(table.action),
  createdAtIdx: index('idx_audit_logs_created_at').on(table.createdAt),
}));
