import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Auditable } from '../../../common/decorators/auditable.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  listCollaboratorsQuerySchema,
  type ListCollaboratorsQueryDto,
} from '@nexus/validators';
import { updateCollaboratorAdminSchema, type UpdateCollaboratorAdminDto } from '../dto/update-collaborator.dto';
import { ListCollaboratorsUseCase } from '../use-cases/list-collaborators.use-case';
import { GetCollaboratorUseCase } from '../use-cases/get-collaborator.use-case';
import { UpdateCollaboratorUseCase } from '../use-cases/update-collaborator.use-case';
import { RegisterCollaboratorToFlashUseCase } from '../use-cases/register-collaborator-to-flash.use-case';
import { SyncFlashCollaboratorsUseCase } from '../use-cases/sync-flash-collaborators.use-case';
import type { Role } from '@nexus/types';

@ApiTags('People - Collaborators')
@ApiBearerAuth()
@Controller('people/collaborators')
@UseGuards(RolesGuard)
export class CollaboratorsController {
  constructor(
    private readonly logger: Logger,
    private readonly listCollaboratorsUseCase: ListCollaboratorsUseCase,
    private readonly getCollaboratorUseCase: GetCollaboratorUseCase,
    private readonly updateCollaboratorUseCase: UpdateCollaboratorUseCase,
    private readonly registerCollaboratorToFlashUseCase: RegisterCollaboratorToFlashUseCase,
    private readonly syncFlashCollaboratorsUseCase: SyncFlashCollaboratorsUseCase,
  ) {}

  @Get()
  @Roles('hr', 'dp', 'hr_admin', 'admin', 'people_manager')
  async list(
    @Query(new ZodValidationPipe(listCollaboratorsQuerySchema)) query: ListCollaboratorsQueryDto,
    @CurrentUser() user: { user_metadata?: { role?: Role; collaborator_id?: string } },
  ) {
    try {
      const role = user?.user_metadata?.role ?? 'employee';

      // people_manager can only see their direct reports
      if (role === 'people_manager' && !query.managerId) {
        const collaboratorId = user.user_metadata?.collaborator_id;
        if (collaboratorId) {
          query = { ...query, managerId: collaboratorId };
        }
      }

      const result = await this.listCollaboratorsUseCase.execute(query);

      // Strip sensitive fields for people_manager
      const data =
        role === 'people_manager'
          ? result.collaborators.map((c) => c.toManagerView())
          : result.collaborators.map((c) => c.toPlainObject());

      return { data, pagination: result.pagination };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      this.logger.error(
        { message, stack },
        `CollaboratorsController.list failed: ${message}`,
      );
      if (process.env.NODE_ENV !== 'development') {
        throw new InternalServerErrorException('Internal server error');
      }
      const fullMessage = stack ? `${message}\n${stack}` : message;
      throw new InternalServerErrorException(fullMessage);
    }
  }

  @Post('flash-sync')
  @Roles('hr_admin', 'admin')
  @Auditable({ action: 'collaborator.flash_sync', entity: 'collaborator' })
  async syncFlash() {
    const result = await this.syncFlashCollaboratorsUseCase.execute();
    return { data: { linked: result.linked } };
  }

  @Get(':id')
  @Roles('hr', 'dp', 'hr_admin', 'admin', 'people_manager')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: { user_metadata: { role: Role } },
  ) {
    const { collaborator, role: profileRole } = await this.getCollaboratorUseCase.execute(id);
    const viewerRole = user.user_metadata.role;

    const data = viewerRole === 'people_manager'
      ? { ...collaborator.toManagerView(), role: profileRole }
      : { ...collaborator.toPlainObject(), role: profileRole };

    return { data };
  }

  @Post(':id/flash-register')
  @Roles('hr', 'dp', 'hr_admin', 'admin')
  @Auditable({ action: 'collaborator.flash_register', entity: 'collaborator', idParam: 'id' })
  async registerFlash(@Param('id') id: string) {
    const collaborator = await this.registerCollaboratorToFlashUseCase.execute(id);
    const { role: profileRole } = await this.getCollaboratorUseCase.execute(id);
    return {
      data: {
        ...collaborator.toPlainObject(),
        role: profileRole,
      },
    };
  }

  @Patch(':id')
  @Roles('hr', 'dp', 'hr_admin', 'admin')
  @Auditable({ action: 'collaborator.update', entity: 'collaborator' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCollaboratorAdminSchema)) dto: UpdateCollaboratorAdminDto,
  ) {
    const collaborator = await this.updateCollaboratorUseCase.execute(id, dto);
    const data = {
      ...collaborator.toPlainObject(),
      ...(dto.role !== undefined && { role: dto.role }),
    };
    return { data };
  }
}
