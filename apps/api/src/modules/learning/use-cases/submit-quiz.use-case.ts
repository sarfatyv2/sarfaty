import { Inject, Injectable } from '@nestjs/common';
import type { SubmitQuizDto } from '@nexus/validators';
import type { QuizQuestion } from '@nexus/types';
import { ENROLLMENT_REPOSITORY, type EnrollmentRepository } from '../domain/enrollment.repository';
import { EnrollmentNotFoundException } from '../domain/exceptions/enrollment-not-found.exception';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { learningLessons } from '../../../database/schema';
import { eq } from 'drizzle-orm';

export interface SubmitQuizResult {
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
}

@Injectable()
export class SubmitQuizUseCase {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: EnrollmentRepository,
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async execute(
    enrollmentId: string,
    lessonId: string,
    dto: SubmitQuizDto,
  ): Promise<SubmitQuizResult> {
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new EnrollmentNotFoundException(enrollmentId);
    }

    // Fetch lesson quiz data
    const [lesson] = await this.db
      .select()
      .from(learningLessons)
      .where(eq(learningLessons.id, lessonId))
      .limit(1);

    if (!lesson?.quiz) {
      throw new Error('This lesson does not have a quiz');
    }

    const questions = lesson.quiz as QuizQuestion[];
    const minScore = lesson.minQuizScore ?? 70;

    // Calculate score
    let correctAnswers = 0;
    for (const answer of dto.answers) {
      const question = questions.find((q) => q.id === answer.questionId);
      if (question?.correctOptionId === answer.selectedOptionId) {
        correctAnswers++;
      }
    }

    const totalQuestions = questions.length;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const passed = score >= minScore;

    // Save quiz result
    await this.enrollmentRepository.saveLessonCompletion({
      enrollmentId,
      lessonId,
      watchedPct: 100,
      quizScore: score,
      quizPassed: passed,
      completedAt: passed ? new Date() : undefined,
    });

    // Start enrollment if first interaction
    if (enrollment.canStart()) {
      await this.enrollmentRepository.update(enrollmentId, {
        status: 'in_progress',
        startedAt: new Date(),
      });
    }

    // Recalculate progress if quiz passed
    if (passed) {
      const completedLessons = await this.enrollmentRepository.countCompletedLessons(enrollmentId);
      const totalLessons = await this.enrollmentRepository.countTotalLessonsForCourse(enrollment.courseId);
      const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      await this.enrollmentRepository.update(enrollmentId, { progressPct });

      if (progressPct === 100) {
        await this.enrollmentRepository.update(enrollmentId, {
          status: 'completed',
          completedAt: new Date(),
        });
      }
    }

    return { score, passed, totalQuestions, correctAnswers };
  }
}
