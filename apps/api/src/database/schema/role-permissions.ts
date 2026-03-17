import { pgTable, uuid, text, primaryKey, index } from 'drizzle-orm/pg-core';
import { roles } from './roles';

export const rolePermissions = pgTable('role_permissions', {
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  featureKey: text('feature_key').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.roleId, table.featureKey] }),
  roleIdx: index('idx_role_permissions_role_id').on(table.roleId),
  featureIdx: index('idx_role_permissions_feature_key').on(table.featureKey),
}));
