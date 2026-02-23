import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Auditable } from '../../../common/decorators/auditable.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  createActionItemSchema,
  updateActionItemSchema,
  listActionItemsQuerySchema,
  createActionUpdateSchema,
  type CreateActionItemDto,
  type UpdateActionItemDto,
  type ListActionItemsQueryDto,
  type CreateActionUpdateDto,
} from '@nexus/validators';
import { CreateActionItemUseCase } from '../use-cases/create-action-item.use-case';
import { UpdateActionItemUseCase } from '../use-cases/update-action-item.use-case';
import { ListActionItemsUseCase } from '../use-cases/list-action-items.use-case';
import { AddActionUpdateUseCase } from '../use-cases/add-action-update.use-case';
import {
  ACTION_ITEM_REPOSITORY,
  ACTION_UPDATE_REPOSITORY,
} from '../domain/action-item.repository';
import type { ActionItemRepository, ActionUpdateRepository } from '../domain/action-item.repository';
import type { Role } from '@nexus/types';
import { ActionItemNotFoundException } from '../domain/exceptions/action-item-not-found.exception';

const MANAGE_ROLES: Role[] = ['admin', 'governance', 'legal', 'compliance_officer', 'backoffice'];
const READ_ROLES: Role[] = [...MANAGE_ROLES, 'sales_director', 'hr_admin', 'people_manager'];

@ApiTags('Governance — Action Items')
@ApiBearerAuth()
@Controller('governance')
@UseGuards(RolesGuard)
export class ActionsController {
  constructor(
    private readonly createActionItemUseCase: CreateActionItemUseCase,
    private readonly updateActionItemUseCase: UpdateActionItemUseCase,
    private readonly listActionItemsUseCase: ListActionItemsUseCase,
    private readonly addActionUpdateUseCase: AddActionUpdateUseCase,
    @Inject(ACTION_ITEM_REPOSITORY)
    private readonly actionItemRepository: ActionItemRepository,
    @Inject(ACTION_UPDATE_REPOSITORY)
    private readonly actionUpdateRepository: ActionUpdateRepository,
  ) {}

  @Post('committees/:committeeId/actions')
  @Roles(...MANAGE_ROLES)
  @Auditable({ action: 'action_item.create', entity: 'action_item' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('committeeId') committeeId: string,
    @Body(new ZodValidationPipe(createActionItemSchema)) dto: CreateActionItemDto,
    @CurrentUser() user: { id: string },
  ) {
    const actionItem = await this.createActionItemUseCase.execute(committeeId, dto, user.id);
    return { data: actionItem.toPlainObject() };
  }

  @Get('actions')
  @Roles(...READ_ROLES)
  async list(
    @Query(new ZodValidationPipe(listActionItemsQuerySchema)) query: ListActionItemsQueryDto,
  ) {
    const result = await this.listActionItemsUseCase.execute(query);
    return {
      data: result.actionItems.map((a) => a.toPlainObject()),
      pagination: result.pagination,
    };
  }

  @Get('actions/:id')
  @Roles(...READ_ROLES)
  async findOne(@Param('id') id: string) {
    const actionItem = await this.actionItemRepository.findById(id);
    if (!actionItem) {
      throw new ActionItemNotFoundException(id);
    }
    return { data: actionItem.toPlainObject() };
  }

  @Patch('actions/:id')
  @Roles(...READ_ROLES)
  @Auditable({ action: 'action_item.update', entity: 'action_item' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateActionItemSchema)) dto: UpdateActionItemDto,
    @CurrentUser() user: { id: string },
  ) {
    const actionItem = await this.updateActionItemUseCase.execute(id, dto, user.id);
    return { data: actionItem.toPlainObject() };
  }

  @Delete('actions/:id')
  @Roles(...MANAGE_ROLES)
  @Auditable({ action: 'action_item.delete', entity: 'action_item' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.actionItemRepository.delete(id);
  }

  @Get('actions/:id/updates')
  @Roles(...READ_ROLES)
  async getUpdates(@Param('id') id: string) {
    const updates = await this.actionUpdateRepository.findByActionItemId(id);
    return { data: updates.map((u) => u.toPlainObject()) };
  }

  @Post('actions/:id/updates')
  @Roles(...READ_ROLES)
  @Auditable({ action: 'action_update.create', entity: 'action_item' })
  @HttpCode(HttpStatus.CREATED)
  async addUpdate(
    @Param('id') actionItemId: string,
    @Body(new ZodValidationPipe(createActionUpdateSchema)) dto: CreateActionUpdateDto,
    @CurrentUser() user: { id: string },
  ) {
    const update = await this.addActionUpdateUseCase.execute(actionItemId, dto, user.id);
    return { data: update.toPlainObject() };
  }
}
