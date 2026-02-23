import { Inject, Injectable } from '@nestjs/common';
import type { ListActionItemsQueryDto } from '@nexus/validators';
import {
  ACTION_ITEM_REPOSITORY,
  type ActionItemRepository,
  type PaginatedActionItems,
} from '../domain/action-item.repository';

@Injectable()
export class ListActionItemsUseCase {
  constructor(
    @Inject(ACTION_ITEM_REPOSITORY)
    private readonly actionItemRepository: ActionItemRepository,
  ) {}

  async execute(query: ListActionItemsQueryDto): Promise<PaginatedActionItems> {
    return this.actionItemRepository.findByFilters({
      committeeId: query.committeeId,
      assigneeId: query.assigneeId,
      status: query.status,
      page: query.page,
      pageSize: query.pageSize,
      sortOrder: query.sortOrder,
    });
  }
}
