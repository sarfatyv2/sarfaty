import { Inject, Injectable } from '@nestjs/common';
import { Enrollment } from '../domain/enrollment.entity';
import { COURSE_REPOSITORY, type CourseRepository } from '../domain/course.repository';
import { ENROLLMENT_REPOSITORY, type EnrollmentRepository } from '../domain/enrollment.repository';
import { CourseNotFoundException } from '../domain/exceptions/course-not-found.exception';
import { CourseNotPublishedException } from '../domain/exceptions/course-not-published.exception';
import { AlreadyEnrolledException } from '../domain/exceptions/already-enrolled.exception';

@Injectable()
export class EnrollCollaboratorUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: EnrollmentRepository,
  ) {}

  async execute(courseId: string, collaboratorId: string): Promise<Enrollment> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new CourseNotFoundException(courseId);
    }

    if (course.status !== 'published') {
      throw new CourseNotPublishedException(courseId);
    }

    const existing = await this.enrollmentRepository.findByCollaboratorAndCourse(
      collaboratorId,
      courseId,
    );
    if (existing) {
      throw new AlreadyEnrolledException(courseId, collaboratorId);
    }

    let deadlineAt: Date | null = null;
    if (course.deadlineDays) {
      deadlineAt = new Date();
      deadlineAt.setDate(deadlineAt.getDate() + course.deadlineDays);
    }

    const enrollment = Enrollment.create({
      courseId,
      collaboratorId,
      deadlineAt,
    });

    return this.enrollmentRepository.save(enrollment);
  }
}
