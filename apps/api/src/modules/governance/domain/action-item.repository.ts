import type { PaginationMeta } from '@nexus/types';
import type { ActionItem } from './action-item.entity';
import type { ActionUpdate } from './action-update.entity';

export const ACTION_ITEM_REPOSITORY = Symbol('ACTION_ITEM_REPOSITORY');
export const ACTION_UPDATE_REPOSITORY = Symbol('ACTION_UPDATE_REPOSITORY');

export interface ActionItemFilters {
  committeeId?: string;
  assigneeId?: string;
  status?: string;
  page: number;
  pageSize: number;
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedActionItems {
  actionItems: ActionItem[];
  pagination: PaginationMeta;
}

export interface ActionItemRepository {
  save(actionItem: ActionItem): Promise<ActionItem>;
  findById(id: string): Promise<ActionItem | null>;
  findByFilters(filters: ActionItemFilters): Promise<PaginatedActionItems>;
  findOverdueByAssignee(assigneeId: string): Promise<ActionItem[]>;
  findDueSoon(withinDays: number): Promise<ActionItem[]>;
  update(id: string, data: Partial<Record<string, unknown>>): Promise<ActionItem | null>;
  delete(id: string): Promise<boolean>;
}

export interface ActionUpdateRepository {
  save(update: ActionUpdate): Promise<ActionUpdate>;
  findByActionItemId(actionItemId: string): Promise<ActionUpdate[]>;
}
