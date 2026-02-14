import { Controller, Get, Post, Patch, Delete, Param, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Auditable } from '../../../common/decorators/auditable.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { createDependentSchema, type CreateDependentDto, updateDependentSchema, type UpdateDependentDto } from '../dto/dependent.dto';
import { ListDependentsUseCase } from '../use-cases/list-dependents.use-case';
import { CreateDependentUseCase } from '../use-cases/create-dependent.use-case';
import { UpdateDependentUseCase } from '../use-cases/update-dependent.use-case';
import { DeleteDependentUseCase } from '../use-cases/delete-dependent.use-case';

@ApiTags('People - Dependents')
@ApiBearerAuth()
@Controller('people/collaborators/:collaboratorId/dependents')
@UseGuards(RolesGuard)
export class DependentsController {
  constructor(
    private readonly listDependentsUseCase: ListDependentsUseCase,
    private readonly createDependentUseCase: CreateDependentUseCase,
    private readonly updateDependentUseCase: UpdateDependentUseCase,
    private readonly deleteDependentUseCase: DeleteDependentUseCase,
  ) {}

  @Get()
  @Roles('hr', 'dp', 'hr_admin', 'admin')
  async list(@Param('collaboratorId') collaboratorId: string) {
    const dependents = await this.listDependentsUseCase.execute(collaboratorId);
    return { data: dependents.map((d) => d.toPlainObject()) };
  }

  @Post()
  @Roles('hr', 'dp', 'hr_admin', 'admin')
  @Auditable({ action: 'dependent.create', entity: 'dependent', idParam: 'collaboratorId' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('collaboratorId') collaboratorId: string,
    @Body(new ZodValidationPipe(createDependentSchema)) dto: CreateDependentDto,
  ) {
    const dependent = await this.createDependentUseCase.execute(collaboratorId, dto);
    return { data: dependent.toPlainObject() };
  }

  @Patch(':id')
  @Roles('hr', 'dp', 'hr_admin', 'admin')
  @Auditable({ action: 'dependent.update', entity: 'dependent' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateDependentSchema)) dto: UpdateDependentDto,
  ) {
    const dependent = await this.updateDependentUseCase.execute(id, dto);
    return { data: dependent.toPlainObject() };
  }

  @Delete(':id')
  @Roles('hr', 'dp', 'hr_admin', 'admin')
  @Auditable({ action: 'dependent.delete', entity: 'dependent' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.deleteDependentUseCase.execute(id);
  }
}
