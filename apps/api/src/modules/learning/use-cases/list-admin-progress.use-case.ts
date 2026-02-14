import { Inject, Injectable } from '@nestjs/common';
import {
  ENROLLMENT_REPOSITORY,
  type EnrollmentRepository,
  type CourseProgressSummary,
  type EnrollmentWithCollaborator,
  type CourseEnrollmentFilters,
} from '../domain/enrollment.repository';

@Injectable()
export class ListAdminProgressUseCase {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepo: EnrollmentRepository,
  ) {}

  async getSummary(): Promise<CourseProgressSummary[]> {
    return this.enrollmentRepo.getProgressSummaryByCourse();
  }

  async getCourseDetail(
    courseId: string,
    filters?: CourseEnrollmentFilters,
  ): Promise<EnrollmentWithCollaborator[]> {
    return this.enrollmentRepo.getEnrollmentsByCourseWithCollaborator(courseId, filters);
  }
}
