import { ActionItem, type ActionItemProps } from '../../domain/action-item.entity';
import type { ActionItemStatus } from '@nexus/types';
import type { govActionItems } from '../../../../database/schema';

type ActionItemRow = typeof govActionItems.$inferSelect;

export class ActionItemMapper {
  static toDomain(row: ActionItemRow): ActionItem {
    const props: ActionItemProps = {
      id: row.id,
      committeeId: row.committeeId,
      minuteId: row.minuteId,
      title: row.title,
      description: row.description,
      assigneeId: row.assigneeId,
      groupLabel: row.groupLabel,
      dueDate: row.dueDate,
      status: row.status as ActionItemStatus,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return ActionItem.reconstitute(props);
  }

  static toPersistence(actionItem: ActionItem): Record<string, unknown> {
    return {
      committeeId: actionItem.committeeId,
      minuteId: actionItem.minuteId,
      title: actionItem.title,
      description: actionItem.description,
      assigneeId: actionItem.assigneeId,
      groupLabel: actionItem.groupLabel,
      dueDate: actionItem.dueDate,
      status: actionItem.status,
      createdBy: actionItem.createdBy,
    };
  }
}
