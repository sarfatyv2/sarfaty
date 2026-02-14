import { Inject, Injectable } from '@nestjs/common';
import type { ListCoursesQueryDto } from '@nexus/validators';
import { COURSE_REPOSITORY, type CourseRepository, type PaginatedCourses } from '../domain/course.repository';

@Injectable()
export class ListCoursesUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
  ) {}

  async execute(query: ListCoursesQueryDto, targetRole?: string): Promise<PaginatedCourses> {
    return this.courseRepository.findByFilters({
      category: query.category,
      status: query.status,
      search: query.search,
      targetRole,
      page: query.page,
      pageSize: query.pageSize,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }
}
