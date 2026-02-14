import { Enrollment, type EnrollmentProps } from '../../domain/enrollment.entity';
import type { EnrollmentStatus } from '@nexus/types';
import type { learningEnrollments } from '../../../../database/schema';

type EnrollmentSelectRow = typeof learningEnrollments.$inferSelect;

export class EnrollmentMapper {
  static toDomain(row: EnrollmentSelectRow): Enrollment {
    const props: EnrollmentProps = {
      id: row.id,
      courseId: row.courseId,
      collaboratorId: row.collaboratorId,
      status: row.status as EnrollmentStatus,
      progressPct: row.progressPct,
      enrolledAt: row.enrolledAt,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      deadlineAt: row.deadlineAt,
      certificateUrl: row.certificateUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return Enrollment.reconstitute(props);
  }

  static toPersistence(enrollment: Enrollment): Record<string, unknown> {
    return {
      courseId: enrollment.courseId,
      collaboratorId: enrollment.collaboratorId,
      status: enrollment.status,
      progressPct: enrollment.progressPct,
      startedAt: enrollment.startedAt,
      completedAt: enrollment.completedAt,
      deadlineAt: enrollment.deadlineAt,
      certificateUrl: enrollment.certificateUrl,
    };
  }
}
