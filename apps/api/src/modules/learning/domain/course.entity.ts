import type { CourseStatus, CourseCategory, Role } from '@nexus/types';

export interface CourseProps {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  category: CourseCategory;
  targetRoles: Role[];
  isMandatory: boolean;
  deadlineDays: number | null;
  status: CourseStatus;
  totalDurationSeconds: number;
  createdBy: string;
  publishedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class Course {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly thumbnailUrl: string | null;
  readonly category: CourseCategory;
  readonly targetRoles: Role[];
  readonly isMandatory: boolean;
  readonly deadlineDays: number | null;
  readonly status: CourseStatus;
  readonly totalDurationSeconds: number;
  readonly createdBy: string;
  readonly publishedAt: Date | null;
  readonly createdAt: Date | null;
  readonly updatedAt: Date | null;

  private constructor(props: CourseProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.thumbnailUrl = props.thumbnailUrl;
    this.category = props.category;
    this.targetRoles = props.targetRoles;
    this.isMandatory = props.isMandatory;
    this.deadlineDays = props.deadlineDays;
    this.status = props.status;
    this.totalDurationSeconds = props.totalDurationSeconds;
    this.createdBy = props.createdBy;
    this.publishedAt = props.publishedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<CourseProps, 'id' | 'status' | 'totalDurationSeconds' | 'publishedAt' | 'createdAt' | 'updatedAt'>,
  ): Course {
    Course.validateTitle(props.title);
    Course.validateTargetRoles(props.targetRoles);

    return new Course({
      ...props,
      id: '',
      status: 'draft',
      totalDurationSeconds: 0,
      publishedAt: null,
      createdAt: null,
      updatedAt: null,
    });
  }

  static reconstitute(props: CourseProps): Course {
    return new Course(props);
  }

  canEdit(): boolean {
    return this.status !== 'archived';
  }

  canPublish(): boolean {
    return this.status === 'draft';
  }

  canArchive(): boolean {
    return this.status === 'published';
  }

  isAvailableForRole(role: Role): boolean {
    return this.status === 'published' && this.targetRoles.includes(role);
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      thumbnailUrl: this.thumbnailUrl,
      category: this.category,
      targetRoles: this.targetRoles,
      isMandatory: this.isMandatory,
      deadlineDays: this.deadlineDays,
      status: this.status,
      totalDurationSeconds: this.totalDurationSeconds,
      createdBy: this.createdBy,
      publishedAt: this.publishedAt?.toISOString() ?? null,
      createdAt: this.createdAt?.toISOString() ?? null,
      updatedAt: this.updatedAt?.toISOString() ?? null,
    };
  }

  private static validateTitle(title: string): void {
    if ((title?.trim().length ?? 0) < 3) {
      throw new Error('Course title must have at least 3 characters');
    }
  }

  private static validateTargetRoles(roles: Role[]): void {
    if (!roles || roles.length === 0) {
      throw new Error('Course must target at least one role');
    }
  }
}
