import { Inject, Injectable } from '@nestjs/common';
import type { CreateCourseDto } from '@nexus/validators';
import { Course } from '../domain/course.entity';
import { COURSE_REPOSITORY, type CourseRepository } from '../domain/course.repository';

export interface CreateCourseInput {
  dto: CreateCourseDto;
  createdBy: string;
}

@Injectable()
export class CreateCourseUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
  ) {}

  async execute(input: CreateCourseInput): Promise<Course> {
    const course = Course.create({
      title: input.dto.title,
      description: input.dto.description ?? null,
      thumbnailUrl: input.dto.thumbnailUrl ?? null,
      category: input.dto.category,
      targetRoles: input.dto.targetRoles,
      isMandatory: input.dto.isMandatory ?? false,
      deadlineDays: input.dto.deadlineDays ?? null,
      createdBy: input.createdBy,
    });

    return this.courseRepository.save(course);
  }
}
