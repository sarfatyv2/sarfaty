import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Auditable } from '../../../common/decorators/auditable.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { MODULE_CATALOG, FEATURE_CATALOG } from '@nexus/types';
import {
  ListRolesUseCase,
  GetRoleUseCase,
  CreateRoleUseCase,
  UpdateRoleUseCase,
  DeleteRoleUseCase,
  SetRolePermissionsUseCase,
  ToggleModulePermissionsUseCase,
} from '../use-cases/roles.use-cases';
import { GetMyPermissionsUseCase } from '../use-cases/get-my-permissions.use-case';
import {
  createRoleSchema,
  updateRoleSchema,
  setPermissionsSchema,
  toggleModuleSchema,
  type CreateRoleDto,
  type UpdateRoleDto,
  type SetPermissionsDto,
  type ToggleModuleDto,
} from '../dto/roles.dto';

interface AuthenticatedRequest {
  user: {
    user_metadata: {
      role: string;
    };
  };
}

@ApiTags('Roles')
@ApiBearerAuth()
@Controller()
export class RolesController {
  constructor(
    private readonly listRolesUseCase: ListRolesUseCase,
    private readonly getRoleUseCase: GetRoleUseCase,
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase,
    private readonly setRolePermissionsUseCase: SetRolePermissionsUseCase,
    private readonly toggleModulePermissionsUseCase: ToggleModulePermissionsUseCase,
    private readonly getMyPermissionsUseCase: GetMyPermissionsUseCase,
  ) {}

  // ── My permissions ──────────────────────────────────────────────────────────

  @Get('my/permissions')
  async getMyPermissions(@Req() req: AuthenticatedRequest) {
    const roleKey = req.user.user_metadata.role;
    const config = await this.getMyPermissionsUseCase.execute(roleKey);
    return { data: config };
  }

  // ── Catalog (admin only) ────────────────────────────────────────────────────

  @Get('catalog/modules')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getCatalogModules() {
    return { data: MODULE_CATALOG };
  }

  @Get('catalog/features')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getCatalogFeatures(@Query('module') moduleKey?: string) {
    const features = moduleKey
      ? FEATURE_CATALOG.filter((f) => f.module === moduleKey)
      : FEATURE_CATALOG;
    return { data: features };
  }

  // ── Roles CRUD (admin only) ──────────────────────────────────────────────────

  @Get('roles')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async listRoles(@Query('includeInactive') includeInactive?: string) {
    const roles = await this.listRolesUseCase.execute(includeInactive === 'true');
    return { data: roles };
  }

  @Get('roles/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getRole(@Param('id') id: string) {
    const role = await this.getRoleUseCase.execute(id);
    return { data: role };
  }

  @Post('roles')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Auditable({ action: 'role.create', entity: 'role' })
  @HttpCode(HttpStatus.CREATED)
  async createRole(@Body(new ZodValidationPipe(createRoleSchema)) dto: CreateRoleDto) {
    const role = await this.createRoleUseCase.execute(dto);
    return { data: role };
  }

  @Patch('roles/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Auditable({ action: 'role.update', entity: 'role' })
  async updateRole(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateRoleSchema)) dto: UpdateRoleDto,
  ) {
    const role = await this.updateRoleUseCase.execute(id, dto);
    return { data: role };
  }

  @Delete('roles/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Auditable({ action: 'role.delete', entity: 'role' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRole(@Param('id') id: string) {
    await this.deleteRoleUseCase.execute(id);
  }

  @Put('roles/:id/permissions')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Auditable({ action: 'role.permissions.set', entity: 'role' })
  async setPermissions(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(setPermissionsSchema)) dto: SetPermissionsDto,
  ) {
    const role = await this.setRolePermissionsUseCase.execute(id, dto);
    return { data: role };
  }

  @Put('roles/:id/modules/:moduleKey')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Auditable({ action: 'role.module.toggle', entity: 'role' })
  async toggleModule(
    @Param('id') id: string,
    @Param('moduleKey') moduleKey: string,
    @Body(new ZodValidationPipe(toggleModuleSchema)) dto: ToggleModuleDto,
  ) {
    const role = await this.toggleModulePermissionsUseCase.execute(id, moduleKey, dto);
    return { data: role };
  }
}
