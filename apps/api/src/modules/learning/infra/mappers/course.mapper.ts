import { Course, type CourseProps } from '../../domain/course.entity';
import type { CourseCategory, Role } from '@nexus/types';
import type { learningCourses } from '../../../../database/schema';

type CourseSelectRow = typeof learningCourses.$inferSelect;

export class CourseMapper {
  static toDomain(row: CourseSelectRow): Course {
    const props: CourseProps = {
      id: row.id,
      title: row.title,
      description: row.description,
      thumbnailUrl: row.thumbnailUrl,
      category: row.category as CourseCategory,
      targetRoles: (row.targetRoles ?? []) as Role[],
      isMandatory: row.isMandatory ?? false,
      deadlineDays: row.deadlineDays,
      status: row.status as CourseProps['status'],
      totalDurationSeconds: row.totalDurationSeconds ?? 0,
      createdBy: row.createdBy,
      publishedAt: row.publishedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return Course.reconstitute(props);
  }

  static toPersistence(course: Course): Record<string, unknown> {
    return {
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      category: course.category,
      targetRoles: course.targetRoles,
      isMandatory: course.isMandatory,
      deadlineDays: course.deadlineDays,
      status: course.status,
      totalDurationSeconds: course.totalDurationSeconds,
      createdBy: course.createdBy,
      publishedAt: course.publishedAt,
    };
  }
}
