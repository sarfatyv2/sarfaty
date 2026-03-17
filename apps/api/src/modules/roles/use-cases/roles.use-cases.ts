import { Inject, Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ROLE_REPOSITORY, type RoleRepository } from '../domain/role.repository';
import { RoleEntity } from '../domain/role.entity';
import { RoleConfigCache } from '../infra/role-config.cache';
import type { CreateRoleDto, UpdateRoleDto, SetPermissionsDto, ToggleModuleDto } from '../dto/roles.dto';
import { FEATURE_CATALOG } from '@nexus/types';

@Injectable()
export class ListRolesUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository,
  ) {}

  async execute(includeInactive = false): Promise<RoleEntity[]> {
    return this.roleRepository.findAll(includeInactive);
  }
}

@Injectable()
export class GetRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository,
  ) {}

  async execute(id: string): Promise<RoleEntity> {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new NotFoundException(`Role ${id} not found`);
    return role;
  }
}

@Injectable()
export class CreateRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository,
  ) {}

  async execute(dto: CreateRoleDto): Promise<RoleEntity> {
    const existing = await this.roleRepository.findByKey(dto.key);
    if (existing) throw new ConflictException(`Role key "${dto.key}" already exists`);

    const role = new RoleEntity({
      id: uuidv4(),
      key: dto.key,
      label: dto.label,
      homeRoute: dto.homeRoute,
      isSystem: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      features: [],
    });

    await this.roleRepository.save(role);
    return role;
  }
}

@Injectable()
export class UpdateRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository,
    private readonly cache: RoleConfigCache,
  ) {}

  async execute(id: string, dto: UpdateRoleDto): Promise<RoleEntity> {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new NotFoundException(`Role ${id} not found`);

    if (dto.label !== undefined) role.updateLabel(dto.label);
    if (dto.homeRoute !== undefined) role.updateHomeRoute(dto.homeRoute);
    if (dto.isActive === true) role.activate();
    if (dto.isActive === false) role.deactivate();

    await this.roleRepository.save(role);
    this.cache.invalidate(role.key);
    return role;
  }
}

@Injectable()
export class DeleteRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository,
    private readonly cache: RoleConfigCache,
  ) {}

  async execute(id: string): Promise<void> {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new NotFoundException(`Role ${id} not found`);
    if (role.isSystem) throw new BadRequestException('Cannot delete a system role');

    await this.roleRepository.delete(id);
    this.cache.invalidate(role.key);
  }
}

@Injectable()
export class SetRolePermissionsUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository,
    private readonly cache: RoleConfigCache,
  ) {}

  async execute(id: string, dto: SetPermissionsDto): Promise<RoleEntity> {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new NotFoundException(`Role ${id} not found`);

    const validKeys = new Set(FEATURE_CATALOG.map((f) => f.key));
    const invalid = dto.featureKeys.filter((k) => !validKeys.has(k));
    if (invalid.length > 0) {
      throw new BadRequestException(`Invalid feature keys: ${invalid.join(', ')}`);
    }

    await this.roleRepository.setPermissions(id, dto.featureKeys);
    role.setFeatures(dto.featureKeys);
    this.cache.invalidate(role.key);
    return role;
  }
}

@Injectable()
export class ToggleModulePermissionsUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: RoleRepository,
    private readonly cache: RoleConfigCache,
  ) {}

  async execute(id: string, moduleKey: string, dto: ToggleModuleDto): Promise<RoleEntity> {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new NotFoundException(`Role ${id} not found`);

    const moduleFeatures = FEATURE_CATALOG
      .filter((f) => f.module === moduleKey)
      .map((f) => f.key);

    if (moduleFeatures.length === 0) {
      throw new BadRequestException(`Module "${moduleKey}" not found in catalog`);
    }

    if (dto.enabled) {
      await this.roleRepository.addModulePermissions(id, moduleFeatures);
    } else {
      await this.roleRepository.removeModulePermissions(id, moduleFeatures);
    }

    this.cache.invalidate(role.key);
    return this.roleRepository.findById(id).then((r) => r ?? role);
  }
}
