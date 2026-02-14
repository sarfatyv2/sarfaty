import type { EnrollmentStatus } from '@nexus/types';

export interface EnrollmentProps {
  id: string;
  courseId: string;
  collaboratorId: string;
  status: EnrollmentStatus;
  progressPct: number;
  enrolledAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  deadlineAt: Date | null;
  certificateUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class Enrollment {
  readonly id: string;
  readonly courseId: string;
  readonly collaboratorId: string;
  readonly status: EnrollmentStatus;
  readonly progressPct: number;
  readonly enrolledAt: Date | null;
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
  readonly deadlineAt: Date | null;
  readonly certificateUrl: string | null;
  readonly createdAt: Date | null;
  readonly updatedAt: Date | null;

  private constructor(props: EnrollmentProps) {
    this.id = props.id;
    this.courseId = props.courseId;
    this.collaboratorId = props.collaboratorId;
    this.status = props.status;
    this.progressPct = props.progressPct;
    this.enrolledAt = props.enrolledAt;
    this.startedAt = props.startedAt;
    this.completedAt = props.completedAt;
    this.deadlineAt = props.deadlineAt;
    this.certificateUrl = props.certificateUrl;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: {
    courseId: string;
    collaboratorId: string;
    deadlineAt: Date | null;
  }): Enrollment {
    return new Enrollment({
      id: '',
      courseId: props.courseId,
      collaboratorId: props.collaboratorId,
      status: 'enrolled',
      progressPct: 0,
      enrolledAt: null,
      startedAt: null,
      completedAt: null,
      deadlineAt: props.deadlineAt,
      certificateUrl: null,
      createdAt: null,
      updatedAt: null,
    });
  }

  static reconstitute(props: EnrollmentProps): Enrollment {
    return new Enrollment(props);
  }

  isExpired(): boolean {
    if (!this.deadlineAt) return false;
    return this.deadlineAt < new Date();
  }

  canStart(): boolean {
    return this.status === 'enrolled';
  }

  canComplete(): boolean {
    return this.status === 'in_progress' && this.progressPct === 100;
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      courseId: this.courseId,
      collaboratorId: this.collaboratorId,
      status: this.status,
      progressPct: this.progressPct,
      enrolledAt: this.enrolledAt?.toISOString() ?? null,
      startedAt: this.startedAt?.toISOString() ?? null,
      completedAt: this.completedAt?.toISOString() ?? null,
      deadlineAt: this.deadlineAt?.toISOString() ?? null,
      certificateUrl: this.certificateUrl,
      createdAt: this.createdAt?.toISOString() ?? null,
      updatedAt: this.updatedAt?.toISOString() ?? null,
    };
  }
}
