import type { AnnouncementStatus } from '@nexus/types';

export interface AnnouncementProps {
  id: string;
  title: string;
  content: string;
  coverImageUrl: string | null;
  targetRoles: string[];
  authorId: string;
  status: AnnouncementStatus;
  publishedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Announcement {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly coverImageUrl: string | null;
  readonly targetRoles: string[];
  readonly authorId: string;
  readonly status: AnnouncementStatus;
  readonly publishedAt: Date | null;
  readonly expiresAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: AnnouncementProps) {
    this.id = props.id;
    this.title = props.title;
    this.content = props.content;
    this.coverImageUrl = props.coverImageUrl;
    this.targetRoles = props.targetRoles;
    this.authorId = props.authorId;
    this.status = props.status;
    this.publishedAt = props.publishedAt;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<AnnouncementProps, 'id' | 'status' | 'publishedAt' | 'createdAt' | 'updatedAt'>,
  ): Announcement {
    return new Announcement({
      ...props,
      id: '',
      status: 'draft',
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: AnnouncementProps): Announcement {
    return new Announcement(props);
  }

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  canPublish(): boolean {
    return this.status === 'draft';
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      coverImageUrl: this.coverImageUrl,
      targetRoles: this.targetRoles,
      authorId: this.authorId,
      status: this.status,
      publishedAt: this.publishedAt?.toISOString() ?? null,
      expiresAt: this.expiresAt?.toISOString() ?? null,
      isExpired: this.isExpired(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
