export interface NotificationProps {
  id: string;
  profileId: string;
  type: string;
  title: string;
  message: string;
  clientId: string | null;
  metadata: Record<string, unknown> | null;
  readAt: Date | null;
  createdAt: Date | null;
}

export class Notification {
  readonly id: string;
  readonly profileId: string;
  readonly type: string;
  readonly title: string;
  readonly message: string;
  readonly clientId: string | null;
  readonly metadata: Record<string, unknown> | null;
  readonly readAt: Date | null;
  readonly createdAt: Date | null;

  private constructor(props: NotificationProps) {
    this.id = props.id;
    this.profileId = props.profileId;
    this.type = props.type;
    this.title = props.title;
    this.message = props.message;
    this.clientId = props.clientId;
    this.metadata = props.metadata;
    this.readAt = props.readAt;
    this.createdAt = props.createdAt;
  }

  static reconstitute(props: NotificationProps): Notification {
    return new Notification(props);
  }

  isRead(): boolean {
    return this.readAt !== null;
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      profileId: this.profileId,
      type: this.type,
      title: this.title,
      message: this.message,
      clientId: this.clientId,
      metadata: this.metadata,
      readAt: this.readAt?.toISOString() ?? null,
      createdAt: this.createdAt?.toISOString() ?? null,
    };
  }
}
