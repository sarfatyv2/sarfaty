import { Global, Module } from '@nestjs/common';
import { RolesController } from './controllers/roles.controller';
import { DrizzleRoleRepository } from './infra/drizzle-role.repository';
import { RoleConfigCache } from './infra/role-config.cache';
import { ROLE_REPOSITORY } from './domain/role.repository';
import {
  ListRolesUseCase,
  GetRoleUseCase,
  CreateRoleUseCase,
  UpdateRoleUseCase,
  DeleteRoleUseCase,
  SetRolePermissionsUseCase,
  ToggleModulePermissionsUseCase,
} from './use-cases/roles.use-cases';
import { GetMyPermissionsUseCase } from './use-cases/get-my-permissions.use-case';

@Global()
@Module({
  controllers: [RolesController],
  providers: [
    RoleConfigCache,
    { provide: ROLE_REPOSITORY, useClass: DrizzleRoleRepository },
    ListRolesUseCase,
    GetRoleUseCase,
    CreateRoleUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
    SetRolePermissionsUseCase,
    ToggleModulePermissionsUseCase,
    GetMyPermissionsUseCase,
  ],
  exports: [RoleConfigCache, ROLE_REPOSITORY],
})
export class RolesModule {}
