import type { ActionItemStatus } from '@nexus/types';

export interface ActionItemProps {
  id: string;
  committeeId: string;
  minuteId: string | null;
  title: string;
  description: string | null;
  assigneeId: string | null;
  groupLabel: string | null;
  dueDate: Date | null;
  status: ActionItemStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ActionItem {
  readonly id: string;
  readonly committeeId: string;
  readonly minuteId: string | null;
  readonly title: string;
  readonly description: string | null;
  readonly assigneeId: string | null;
  readonly groupLabel: string | null;
  readonly dueDate: Date | null;
  readonly status: ActionItemStatus;
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: ActionItemProps) {
    this.id = props.id;
    this.committeeId = props.committeeId;
    this.minuteId = props.minuteId;
    this.title = props.title;
    this.description = props.description;
    this.assigneeId = props.assigneeId;
    this.groupLabel = props.groupLabel;
    this.dueDate = props.dueDate;
    this.status = props.status;
    this.createdBy = props.createdBy;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<ActionItemProps, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
  ): ActionItem {
    return new ActionItem({
      ...props,
      id: '',
      status: 'todo',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: ActionItemProps): ActionItem {
    return new ActionItem(props);
  }

  isOverdue(): boolean {
    if (!this.dueDate || this.status === 'done') return false;
    return new Date() > this.dueDate;
  }

  isDueSoon(withinDays = 3): boolean {
    if (!this.dueDate || this.status === 'done') return false;
    const diffMs = this.dueDate.getTime() - Date.now();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= withinDays;
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      committeeId: this.committeeId,
      minuteId: this.minuteId,
      title: this.title,
      description: this.description,
      assigneeId: this.assigneeId,
      groupLabel: this.groupLabel,
      dueDate: this.dueDate?.toISOString() ?? null,
      status: this.status,
      isOverdue: this.isOverdue(),
      isDueSoon: this.isDueSoon(),
      createdBy: this.createdBy,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
