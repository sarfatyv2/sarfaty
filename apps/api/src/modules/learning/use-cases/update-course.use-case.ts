import { Inject, Injectable } from '@nestjs/common';
import type { UpdateCourseDto } from '@nexus/validators';
import type { Course } from '../domain/course.entity';
import { COURSE_REPOSITORY, type CourseRepository } from '../domain/course.repository';
import { CourseNotFoundException } from '../domain/exceptions/course-not-found.exception';

@Injectable()
export class UpdateCourseUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
  ) {}

  async execute(id: string, dto: UpdateCourseDto): Promise<Course> {
    const existing = await this.courseRepository.findById(id);
    if (!existing) {
      throw new CourseNotFoundException(id);
    }

    if (!existing.canEdit()) {
      throw new CourseNotFoundException(id);
    }

    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.thumbnailUrl !== undefined) data.thumbnailUrl = dto.thumbnailUrl;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.targetRoles !== undefined) data.targetRoles = dto.targetRoles;
    if (dto.isMandatory !== undefined) data.isMandatory = dto.isMandatory;
    if (dto.deadlineDays !== undefined) data.deadlineDays = dto.deadlineDays;

    const updated = await this.courseRepository.update(id, data);
    if (!updated) {
      throw new CourseNotFoundException(id);
    }

    return updated;
  }
}
