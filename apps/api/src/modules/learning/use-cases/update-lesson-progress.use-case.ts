import { Inject, Injectable } from '@nestjs/common';
import { ENROLLMENT_REPOSITORY, type EnrollmentRepository } from '../domain/enrollment.repository';
import { EnrollmentNotFoundException } from '../domain/exceptions/enrollment-not-found.exception';

@Injectable()
export class UpdateLessonProgressUseCase {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: EnrollmentRepository,
  ) {}

  async execute(
    enrollmentId: string,
    lessonId: string,
    watchedPct: number,
  ): Promise<{ progressPct: number; lessonCompleted: boolean }> {
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new EnrollmentNotFoundException(enrollmentId);
    }

    const isLessonComplete = watchedPct >= 90;

    await this.enrollmentRepository.saveLessonCompletion({
      enrollmentId,
      lessonId,
      watchedPct,
      completedAt: isLessonComplete ? new Date() : undefined,
    });

    // Start enrollment if first interaction
    if (enrollment.canStart()) {
      await this.enrollmentRepository.update(enrollmentId, {
        status: 'in_progress',
        startedAt: new Date(),
      });
    }

    // Recalculate progress
    const completedLessons = await this.enrollmentRepository.countCompletedLessons(enrollmentId);
    const totalLessons = await this.enrollmentRepository.countTotalLessonsForCourse(enrollment.courseId);

    const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    await this.enrollmentRepository.update(enrollmentId, { progressPct });

    // Auto-complete if 100%
    if (progressPct === 100 && enrollment.status !== 'completed') {
      await this.enrollmentRepository.update(enrollmentId, {
        status: 'completed',
        completedAt: new Date(),
      });
    }

    return { progressPct, lessonCompleted: isLessonComplete };
  }
}
