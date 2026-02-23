import type { MinuteStatus } from '@nexus/types';

export interface MeetingMinuteProps {
  id: string;
  meetingId: string;
  content: unknown;
  status: MinuteStatus;
  publishedAt: Date | null;
  publishedBy: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MeetingMinute {
  readonly id: string;
  readonly meetingId: string;
  readonly content: unknown;
  readonly status: MinuteStatus;
  readonly publishedAt: Date | null;
  readonly publishedBy: string | null;
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: MeetingMinuteProps) {
    this.id = props.id;
    this.meetingId = props.meetingId;
    this.content = props.content;
    this.status = props.status;
    this.publishedAt = props.publishedAt;
    this.publishedBy = props.publishedBy;
    this.createdBy = props.createdBy;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<MeetingMinuteProps, 'id' | 'status' | 'publishedAt' | 'publishedBy' | 'createdAt' | 'updatedAt'>,
  ): MeetingMinute {
    return new MeetingMinute({
      ...props,
      id: '',
      status: 'draft',
      publishedAt: null,
      publishedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: MeetingMinuteProps): MeetingMinute {
    return new MeetingMinute(props);
  }

  canPublish(): boolean {
    return this.status === 'draft';
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      meetingId: this.meetingId,
      content: this.content,
      status: this.status,
      publishedAt: this.publishedAt?.toISOString() ?? null,
      publishedBy: this.publishedBy,
      createdBy: this.createdBy,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
