export interface ActionUpdateProps {
  id: string;
  actionItemId: string;
  authorId: string;
  comment: string;
  statusChange: string | null;
  createdAt: Date;
}

export class ActionUpdate {
  readonly id: string;
  readonly actionItemId: string;
  readonly authorId: string;
  readonly comment: string;
  readonly statusChange: string | null;
  readonly createdAt: Date;

  private constructor(props: ActionUpdateProps) {
    this.id = props.id;
    this.actionItemId = props.actionItemId;
    this.authorId = props.authorId;
    this.comment = props.comment;
    this.statusChange = props.statusChange;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<ActionUpdateProps, 'id' | 'createdAt'>,
  ): ActionUpdate {
    return new ActionUpdate({
      ...props,
      id: '',
      createdAt: new Date(),
    });
  }

  static reconstitute(props: ActionUpdateProps): ActionUpdate {
    return new ActionUpdate(props);
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      actionItemId: this.actionItemId,
      authorId: this.authorId,
      comment: this.comment,
      statusChange: this.statusChange,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
