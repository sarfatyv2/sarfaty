import { Inject, Injectable } from '@nestjs/common';
import type { CreateActionUpdateDto } from '@nexus/validators';
import { ActionUpdate } from '../domain/action-update.entity';
import {
  ACTION_ITEM_REPOSITORY,
  ACTION_UPDATE_REPOSITORY,
  type ActionItemRepository,
  type ActionUpdateRepository,
} from '../domain/action-item.repository';
import { ActionItemNotFoundException } from '../domain/exceptions/action-item-not-found.exception';

@Injectable()
export class AddActionUpdateUseCase {
  constructor(
    @Inject(ACTION_ITEM_REPOSITORY)
    private readonly actionItemRepository: ActionItemRepository,
    @Inject(ACTION_UPDATE_REPOSITORY)
    private readonly actionUpdateRepository: ActionUpdateRepository,
  ) {}

  async execute(
    actionItemId: string,
    dto: CreateActionUpdateDto,
    authorId: string,
  ): Promise<ActionUpdate> {
    const actionItem = await this.actionItemRepository.findById(actionItemId);
    if (!actionItem) {
      throw new ActionItemNotFoundException(actionItemId);
    }

    if (dto.statusChange && dto.statusChange !== actionItem.status) {
      await this.actionItemRepository.update(actionItemId, { status: dto.statusChange });
    }

    const update = ActionUpdate.create({
      actionItemId,
      authorId,
      comment: dto.comment,
      statusChange: dto.statusChange ?? null,
    });

    return this.actionUpdateRepository.save(update);
  }
}
