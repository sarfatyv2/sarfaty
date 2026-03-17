import { Inject, Injectable } from '@nestjs/common';
import { eq, and, inArray } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { roles } from '../../../database/schema/roles';
import { rolePermissions } from '../../../database/schema/role-permissions';
import type { RoleRepository } from '../domain/role.repository';
import { RoleEntity } from '../domain/role.entity';

@Injectable()
export class DrizzleRoleRepository implements RoleRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(includeInactive = false): Promise<RoleEntity[]> {
    const rows = await this.db
      .select()
      .from(roles)
      .where(includeInactive ? undefined : eq(roles.isActive, true))
      .orderBy(roles.key);

    if (rows.length === 0) return [];

    const roleIds = rows.map((r) => r.id);
    const permRows = await this.db
      .select()
      .from(rolePermissions)
      .where(inArray(rolePermissions.roleId, roleIds));

    const featuresMap = new Map<string, string[]>();
    for (const perm of permRows) {
      const existing = featuresMap.get(perm.roleId) ?? [];
      existing.push(perm.featureKey);
      featuresMap.set(perm.roleId, existing);
    }

    return rows.map((row) => this.toDomain(row, featuresMap.get(row.id) ?? []));
  }

  async findById(id: string): Promise<RoleEntity | null> {
    const rows = await this.db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    const permRows = await this.db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, id));

    return this.toDomain(row, permRows.map((p) => p.featureKey));
  }

  async findByKey(key: string): Promise<RoleEntity | null> {
    const rows = await this.db
      .select()
      .from(roles)
      .where(and(eq(roles.key, key), eq(roles.isActive, true)))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    const permRows = await this.db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, row.id));

    return this.toDomain(row, permRows.map((p) => p.featureKey));
  }

  async save(role: RoleEntity): Promise<void> {
    await this.db
      .insert(roles)
      .values({
        id: role.id,
        key: role.key,
        label: role.label,
        homeRoute: role.homeRoute,
        isSystem: role.isSystem,
        isActive: role.isActive,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      })
      .onConflictDoUpdate({
        target: roles.id,
        set: {
          label: role.label,
          homeRoute: role.homeRoute,
          isActive: role.isActive,
          updatedAt: role.updatedAt,
        },
      });
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(roles).where(eq(roles.id, id));
  }

  async setPermissions(roleId: string, featureKeys: string[]): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

      if (featureKeys.length > 0) {
        await tx.insert(rolePermissions).values(
          featureKeys.map((featureKey) => ({ roleId, featureKey })),
        );
      }
    });
  }

  async addModulePermissions(roleId: string, featureKeys: string[]): Promise<void> {
    if (featureKeys.length === 0) return;

    await this.db
      .insert(rolePermissions)
      .values(featureKeys.map((featureKey) => ({ roleId, featureKey })))
      .onConflictDoNothing();
  }

  async removeModulePermissions(roleId: string, featureKeys: string[]): Promise<void> {
    if (featureKeys.length === 0) return;

    await this.db
      .delete(rolePermissions)
      .where(
        and(
          eq(rolePermissions.roleId, roleId),
          inArray(rolePermissions.featureKey, featureKeys),
        ),
      );
  }

  private toDomain(
    row: typeof roles.$inferSelect,
    features: string[],
  ): RoleEntity {
    return new RoleEntity({
      id: row.id,
      key: row.key,
      label: row.label,
      homeRoute: row.homeRoute,
      isSystem: row.isSystem,
      isActive: row.isActive,
      createdAt: row.createdAt ?? new Date(),
      updatedAt: row.updatedAt ?? new Date(),
      features,
    });
  }
}
