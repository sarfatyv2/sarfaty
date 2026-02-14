import { Inject, Injectable } from '@nestjs/common';
import { eq, and, or, count, isNotNull, sql, ilike } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import {
  learningEnrollments,
  learningLessonCompletions,
  learningLessons,
  learningModules,
  learningCourses,
  collaborators,
} from '../../../database/schema';
import type {
  EnrollmentRepository,
  LessonCompletionData,
  LessonCompletion,
  EnrollmentWithCourse,
  CourseProgressSummary,
  EnrollmentWithCollaborator,
  CourseEnrollmentFilters,
} from '../domain/enrollment.repository';
import type { Enrollment } from '../domain/enrollment.entity';
import { EnrollmentMapper } from './mappers/enrollment.mapper';

@Injectable()
export class DrizzleEnrollmentRepository implements EnrollmentRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(enrollment: Enrollment): Promise<Enrollment> {
    const data = EnrollmentMapper.toPersistence(enrollment);
    const rows = await this.db
      .insert(learningEnrollments)
      .values(data as typeof learningEnrollments.$inferInsert)
      .returning();
    const row = rows[0]!;
    return EnrollmentMapper.toDomain(row);
  }

  async findById(id: string): Promise<Enrollment | null> {
    const [row] = await this.db
      .select()
      .from(learningEnrollments)
      .where(eq(learningEnrollments.id, id))
      .limit(1);
    return row ? EnrollmentMapper.toDomain(row) : null;
  }

  async findByCollaboratorAndCourse(
    collaboratorId: string,
    courseId: string,
  ): Promise<Enrollment | null> {
    const [row] = await this.db
      .select()
      .from(learningEnrollments)
      .where(
        and(
          eq(learningEnrollments.collaboratorId, collaboratorId),
          eq(learningEnrollments.courseId, courseId),
        ),
      )
      .limit(1);
    return row ? EnrollmentMapper.toDomain(row) : null;
  }

  async findByCollaboratorWithCourse(collaboratorId: string): Promise<EnrollmentWithCourse[]> {
    const rows = await this.db
      .select({
        enrollment: learningEnrollments,
        courseTitle: learningCourses.title,
        courseCategory: learningCourses.category,
        courseThumbnailUrl: learningCourses.thumbnailUrl,
        courseTotalDurationSeconds: learningCourses.totalDurationSeconds,
      })
      .from(learningEnrollments)
      .innerJoin(learningCourses, eq(learningEnrollments.courseId, learningCourses.id))
      .where(eq(learningEnrollments.collaboratorId, collaboratorId));

    return rows.map((row) => {
      const enrollment = EnrollmentMapper.toDomain(row.enrollment);
      return Object.assign(enrollment, {
        courseTitle: row.courseTitle,
        courseCategory: row.courseCategory,
        courseThumbnailUrl: row.courseThumbnailUrl,
        courseTotalDurationSeconds: row.courseTotalDurationSeconds ?? 0,
      }) as EnrollmentWithCourse;
    });
  }

  async findByCourse(courseId: string): Promise<Enrollment[]> {
    const rows = await this.db
      .select()
      .from(learningEnrollments)
      .where(eq(learningEnrollments.courseId, courseId));
    return rows.map((row) => EnrollmentMapper.toDomain(row));
  }

  async update(id: string, data: Record<string, unknown>): Promise<Enrollment | null> {
    const [row] = await this.db
      .update(learningEnrollments)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof learningEnrollments.$inferInsert>)
      .where(eq(learningEnrollments.id, id))
      .returning();
    return row ? EnrollmentMapper.toDomain(row) : null;
  }

  async saveLessonCompletion(data: LessonCompletionData): Promise<void> {
    const existing = await this.findLessonCompletion(data.enrollmentId, data.lessonId);

    if (existing) {
      const updateData: Record<string, unknown> = {
        watchedPct: data.watchedPct,
      };
      if (data.quizScore !== undefined) updateData.quizScore = data.quizScore;
      if (data.quizPassed !== undefined) updateData.quizPassed = data.quizPassed;
      if (data.completedAt) updateData.completedAt = data.completedAt;

      await this.db
        .update(learningLessonCompletions)
        .set(updateData as Partial<typeof learningLessonCompletions.$inferInsert>)
        .where(eq(learningLessonCompletions.id, existing.id));
    } else {
      await this.db.insert(learningLessonCompletions).values({
        enrollmentId: data.enrollmentId,
        lessonId: data.lessonId,
        watchedPct: data.watchedPct,
        quizScore: data.quizScore ?? null,
        quizPassed: data.quizPassed ?? null,
        completedAt: data.completedAt ?? null,
      });
    }
  }

  async findLessonCompletion(
    enrollmentId: string,
    lessonId: string,
  ): Promise<LessonCompletion | null> {
    const [row] = await this.db
      .select()
      .from(learningLessonCompletions)
      .where(
        and(
          eq(learningLessonCompletions.enrollmentId, enrollmentId),
          eq(learningLessonCompletions.lessonId, lessonId),
        ),
      )
      .limit(1);

    if (!row) return null;

    return {
      id: row.id,
      enrollmentId: row.enrollmentId,
      lessonId: row.lessonId,
      watchedPct: row.watchedPct,
      quizScore: row.quizScore,
      quizPassed: row.quizPassed,
      completedAt: row.completedAt,
      createdAt: row.createdAt,
    };
  }

  async findCompletedLessonIdsByEnrollment(enrollmentId: string): Promise<string[]> {
    const rows = await this.db
      .select({ lessonId: learningLessonCompletions.lessonId })
      .from(learningLessonCompletions)
      .where(
        and(
          eq(learningLessonCompletions.enrollmentId, enrollmentId),
          isNotNull(learningLessonCompletions.completedAt),
        ),
      );
    return rows.map((r) => r.lessonId);
  }

  async countCompletedLessons(enrollmentId: string): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(learningLessonCompletions)
      .where(
        and(
          eq(learningLessonCompletions.enrollmentId, enrollmentId),
          isNotNull(learningLessonCompletions.completedAt),
        ),
      );
    return result?.count ?? 0;
  }

  async countTotalLessonsForCourse(courseId: string): Promise<number> {
    const moduleRows = await this.db
      .select({ id: learningModules.id })
      .from(learningModules)
      .where(eq(learningModules.courseId, courseId));

    if (moduleRows.length === 0) return 0;

    const moduleConditions = moduleRows.map((m) => eq(learningLessons.moduleId, m.id));
    const whereClause = moduleConditions.length === 1
      ? moduleConditions[0]!
      : or(...moduleConditions);

    const [result] = await this.db
      .select({ count: count() })
      .from(learningLessons)
      .where(whereClause);

    return result?.count ?? 0;
  }

  async getProgressSummaryByCourse(): Promise<CourseProgressSummary[]> {
    const rows = await this.db
      .select({
        courseId: learningCourses.id,
        courseTitle: learningCourses.title,
        category: learningCourses.category,
        isMandatory: learningCourses.isMandatory,
        totalEnrolled: count(learningEnrollments.id),
        inProgress: sql<number>`count(*) filter (where ${learningEnrollments.status} = 'in_progress')`,
        completed: sql<number>`count(*) filter (where ${learningEnrollments.status} = 'completed')`,
        avgProgressPct: sql<number>`coalesce(avg(${learningEnrollments.progressPct}), 0)`,
      })
      .from(learningCourses)
      .leftJoin(learningEnrollments, eq(learningCourses.id, learningEnrollments.courseId))
      .where(eq(learningCourses.status, 'published'))
      .groupBy(learningCourses.id, learningCourses.title, learningCourses.category, learningCourses.isMandatory)
      .orderBy(learningCourses.title);

    return rows.map((row) => ({
      courseId: row.courseId,
      courseTitle: row.courseTitle,
      category: row.category,
      isMandatory: row.isMandatory ?? false,
      totalEnrolled: Number(row.totalEnrolled),
      inProgress: Number(row.inProgress),
      completed: Number(row.completed),
      avgProgressPct: Math.round(Number(row.avgProgressPct)),
    }));
  }

  async getEnrollmentsByCourseWithCollaborator(
    courseId: string,
    filters?: CourseEnrollmentFilters,
  ): Promise<EnrollmentWithCollaborator[]> {
    const conditions = [eq(learningEnrollments.courseId, courseId)];

    if (filters?.status) {
      conditions.push(eq(learningEnrollments.status, filters.status));
    }

    if (filters?.search) {
      conditions.push(ilike(collaborators.fullName, `%${filters.search}%`));
    }

    const rows = await this.db
      .select({
        enrollmentId: learningEnrollments.id,
        collaboratorId: collaborators.id,
        collaboratorName: collaborators.fullName,
        department: collaborators.department,
        jobTitle: collaborators.jobTitle,
        status: learningEnrollments.status,
        progressPct: learningEnrollments.progressPct,
        enrolledAt: learningEnrollments.enrolledAt,
        startedAt: learningEnrollments.startedAt,
        completedAt: learningEnrollments.completedAt,
        deadlineAt: learningEnrollments.deadlineAt,
      })
      .from(learningEnrollments)
      .innerJoin(collaborators, eq(learningEnrollments.collaboratorId, collaborators.id))
      .where(and(...conditions))
      .orderBy(collaborators.fullName);

    return rows;
  }
}
