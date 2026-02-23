import type { MeetingStatus } from '@nexus/types';

export interface MeetingProps {
  id: string;
  committeeId: string;
  title: string;
  description: string | null;
  scheduledAt: Date;
  locationOrLink: string | null;
  status: MeetingStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Meeting {
  readonly id: string;
  readonly committeeId: string;
  readonly title: string;
  readonly description: string | null;
  readonly scheduledAt: Date;
  readonly locationOrLink: string | null;
  readonly status: MeetingStatus;
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: MeetingProps) {
    this.id = props.id;
    this.committeeId = props.committeeId;
    this.title = props.title;
    this.description = props.description;
    this.scheduledAt = props.scheduledAt;
    this.locationOrLink = props.locationOrLink;
    this.status = props.status;
    this.createdBy = props.createdBy;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<MeetingProps, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
  ): Meeting {
    return new Meeting({
      ...props,
      id: '',
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: MeetingProps): Meeting {
    return new Meeting(props);
  }

  canComplete(): boolean {
    return this.status === 'happening' || this.status === 'scheduled';
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      committeeId: this.committeeId,
      title: this.title,
      description: this.description,
      scheduledAt: this.scheduledAt.toISOString(),
      locationOrLink: this.locationOrLink,
      status: this.status,
      createdBy: this.createdBy,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
