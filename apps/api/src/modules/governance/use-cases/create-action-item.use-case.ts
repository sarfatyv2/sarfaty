import { Inject, Injectable } from '@nestjs/common';
import type { CreateActionItemDto } from '@nexus/validators';
import { ActionItem } from '../domain/action-item.entity';
import {
  ACTION_ITEM_REPOSITORY,
  type ActionItemRepository,
} from '../domain/action-item.repository';
import { COMMITTEE_REPOSITORY, type CommitteeRepository } from '../domain/committee.repository';
import { CommitteeNotFoundException } from '../domain/exceptions/committee-not-found.exception';

@Injectable()
export class CreateActionItemUseCase {
  constructor(
    @Inject(COMMITTEE_REPOSITORY)
    private readonly committeeRepository: CommitteeRepository,
    @Inject(ACTION_ITEM_REPOSITORY)
    private readonly actionItemRepository: ActionItemRepository,
  ) {}

  async execute(committeeId: string, dto: CreateActionItemDto, createdBy: string): Promise<ActionItem> {
    const committee = await this.committeeRepository.findById(committeeId);
    if (!committee) {
      throw new CommitteeNotFoundException(committeeId);
    }

    const actionItem = ActionItem.create({
      committeeId,
      minuteId: dto.minuteId ?? null,
      title: dto.title,
      description: dto.description ?? null,
      assigneeId: dto.assigneeId ?? null,
      groupLabel: dto.groupLabel ?? null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      createdBy,
    });

    return this.actionItemRepository.save(actionItem);
  }
}
