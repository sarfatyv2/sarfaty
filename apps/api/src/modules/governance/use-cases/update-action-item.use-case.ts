import { Inject, Injectable } from '@nestjs/common';
import type { UpdateActionItemDto } from '@nexus/validators';
import { ActionItem } from '../domain/action-item.entity';
import {
  ACTION_ITEM_REPOSITORY,
  ACTION_UPDATE_REPOSITORY,
  type ActionItemRepository,
  type ActionUpdateRepository,
} from '../domain/action-item.repository';
import { ActionItemNotFoundException } from '../domain/exceptions/action-item-not-found.exception';
import { ActionUpdate } from '../domain/action-update.entity';

@Injectable()
export class UpdateActionItemUseCase {
  constructor(
    @Inject(ACTION_ITEM_REPOSITORY)
    private readonly actionItemRepository: ActionItemRepository,
    @Inject(ACTION_UPDATE_REPOSITORY)
    private readonly actionUpdateRepository: ActionUpdateRepository,
  ) {}

  async execute(id: string, dto: UpdateActionItemDto, updatedBy: string): Promise<ActionItem> {
    const existing = await this.actionItemRepository.findById(id);
    if (!existing) {
      throw new ActionItemNotFoundException(id);
    }

    const updateData: Record<string, unknown> = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.assigneeId !== undefined) updateData.assigneeId = dto.assigneeId;
    if (dto.groupLabel !== undefined) updateData.groupLabel = dto.groupLabel;
    if (dto.dueDate !== undefined) updateData.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    if (dto.status !== undefined) updateData.status = dto.status;

    if (dto.status && dto.status !== existing.status) {
      const statusUpdate = ActionUpdate.create({
        actionItemId: id,
        authorId: updatedBy,
        comment: `Status updated to "${dto.status}"`,
        statusChange: dto.status,
      });
      await this.actionUpdateRepository.save(statusUpdate);
    }

    const updated = await this.actionItemRepository.update(id, updateData);
    if (!updated) {
      throw new ActionItemNotFoundException(id);
    }

    return updated;
  }
}
