import { Inject, Injectable } from '@nestjs/common';
import { Enrollment } from '../domain/enrollment.entity';
import { COURSE_REPOSITORY, type CourseRepository } from '../domain/course.repository';
import { ENROLLMENT_REPOSITORY, type EnrollmentRepository } from '../domain/enrollment.repository';
import { CourseNotFoundException } from '../domain/exceptions/course-not-found.exception';

@Injectable()
export class AutoEnrollMandatoryUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: EnrollmentRepository,
  ) {}

  async execute(courseId: string, collaboratorIds: string[]): Promise<number> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new CourseNotFoundException(courseId);
    }

    let enrolledCount = 0;

    for (const collaboratorId of collaboratorIds) {
      const existing = await this.enrollmentRepository.findByCollaboratorAndCourse(
        collaboratorId,
        courseId,
      );

      if (!existing) {
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

        await this.enrollmentRepository.save(enrollment);
        enrolledCount++;
      }
    }

    return enrolledCount;
  }
}
