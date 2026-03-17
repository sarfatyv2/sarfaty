import type { RoleEntity } from './role.entity';

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

export interface RoleRepository {
  findAll(includeInactive?: boolean): Promise<RoleEntity[]>;
  findById(id: string): Promise<RoleEntity | null>;
  findByKey(key: string): Promise<RoleEntity | null>;
  save(role: RoleEntity): Promise<void>;
  delete(id: string): Promise<void>;
  setPermissions(roleId: string, featureKeys: string[]): Promise<void>;
  addModulePermissions(roleId: string, featureKeys: string[]): Promise<void>;
  removeModulePermissions(roleId: string, featureKeys: string[]): Promise<void>;
}
