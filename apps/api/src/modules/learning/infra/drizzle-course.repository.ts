import { Inject, Injectable } from '@nestjs/common';
import { eq, and, ilike, or, desc, asc, count, arrayContains } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import {
  learningCourses,
  learningModules,
  learningLessons,
} from '../../../database/schema';
import type {
  CourseRepository,
  CourseFilters,
  PaginatedCourses,
  CourseWithModulesAndLessons,
} from '../domain/course.repository';
import type { Course } from '../domain/course.entity';
import { CourseMapper } from './mappers/course.mapper';

@Injectable()
export class DrizzleCourseRepository implements CourseRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(course: Course): Promise<Course> {
    const data = CourseMapper.toPersistence(course);
    const rows = await this.db
      .insert(learningCourses)
      .values(data as typeof learningCourses.$inferInsert)
      .returning();
    const row = rows[0]!;
    return CourseMapper.toDomain(row);
  }

  async findById(id: string): Promise<Course | null> {
    const [row] = await this.db
      .select()
      .from(learningCourses)
      .where(eq(learningCourses.id, id))
      .limit(1);
    return row ? CourseMapper.toDomain(row) : null;
  }

  async findByIdWithModulesAndLessons(id: string): Promise<CourseWithModulesAndLessons | null> {
    const [courseRow] = await this.db
      .select()
      .from(learningCourses)
      .where(eq(learningCourses.id, id))
      .limit(1);

    if (!courseRow) return null;

    const moduleRows = await this.db
      .select()
      .from(learningModules)
      .where(eq(learningModules.courseId, id))
      .orderBy(asc(learningModules.sortOrder));

    const lessonRows = await this.db
      .select()
      .from(learningLessons)
      .where(
        moduleRows.length > 0
          ? or(...moduleRows.map((m) => eq(learningLessons.moduleId, m.id)))
          : eq(learningLessons.moduleId, '00000000-0000-0000-0000-000000000000'),
      )
      .orderBy(asc(learningLessons.sortOrder));

    const modules = moduleRows.map((mod) => ({
      id: mod.id,
      title: mod.title,
      sortOrder: mod.sortOrder,
      lessons: lessonRows
        .filter((l) => l.moduleId === mod.id)
        .map((l) => ({
          id: l.id,
          title: l.title,
          description: l.description,
          youtubeVideoId: l.youtubeVideoId,
          durationSeconds: l.durationSeconds,
          sortOrder: l.sortOrder,
          hasQuiz: l.quiz !== null && l.quiz !== undefined,
        })),
    }));

    return {
      course: CourseMapper.toDomain(courseRow),
      modules,
      totalLessons: lessonRows.length,
    };
  }

  async findByFilters(filters: CourseFilters): Promise<PaginatedCourses> {
    const conditions = [];

    if (filters.status) {
      conditions.push(eq(learningCourses.status, filters.status));
    }
    if (filters.category) {
      conditions.push(eq(learningCourses.category, filters.category));
    }
    if (filters.targetRole) {
      conditions.push(arrayContains(learningCourses.targetRoles, [filters.targetRole]));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(learningCourses.title, `%${filters.search}%`),
          ilike(learningCourses.description, `%${filters.search}%`),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderColumn = learningCourses.createdAt as typeof learningCourses.createdAt | typeof learningCourses.title | typeof learningCourses.category;
    if (filters.sortBy === 'title') {
      orderColumn = learningCourses.title;
    } else if (filters.sortBy === 'category') {
      orderColumn = learningCourses.category;
    }
    const orderFn = filters.sortOrder === 'asc' ? asc : desc;

    const offset = (filters.page - 1) * filters.pageSize;

    const [rows, [totalRow]] = await Promise.all([
      this.db
        .select()
        .from(learningCourses)
        .where(whereClause)
        .orderBy(orderFn(orderColumn))
        .limit(filters.pageSize)
        .offset(offset),
      this.db
        .select({ count: count() })
        .from(learningCourses)
        .where(whereClause),
    ]);

    const total = totalRow?.count ?? 0;

    return {
      courses: rows.map((row) => CourseMapper.toDomain(row)),
      pagination: {
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(total / filters.pageSize),
      },
    };
  }

  async update(id: string, data: Record<string, unknown>): Promise<Course | null> {
    const [row] = await this.db
      .update(learningCourses)
      .set({ ...data, updatedAt: new Date() } as Partial<typeof learningCourses.$inferInsert>)
      .where(eq(learningCourses.id, id))
      .returning();
    return row ? CourseMapper.toDomain(row) : null;
  }
}
