import { Inject, Injectable } from '@nestjs/common';
import type { Course } from '../domain/course.entity';
import { COURSE_REPOSITORY, type CourseRepository } from '../domain/course.repository';
import { CourseNotFoundException } from '../domain/exceptions/course-not-found.exception';
import { CourseNotPublishedException } from '../domain/exceptions/course-not-published.exception';

@Injectable()
export class PublishCourseUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
  ) {}

  async execute(id: string): Promise<Course> {
    const courseWithDetails = await this.courseRepository.findByIdWithModulesAndLessons(id);
    if (!courseWithDetails) {
      throw new CourseNotFoundException(id);
    }

    const { course } = courseWithDetails;

    if (!course.canPublish()) {
      throw new CourseNotPublishedException(id);
    }

    if (courseWithDetails.totalLessons === 0) {
      throw new CourseNotPublishedException(id);
    }

    // Calculate total duration from all lessons
    let totalDuration = 0;
    for (const mod of courseWithDetails.modules) {
      for (const lesson of mod.lessons) {
        totalDuration += lesson.durationSeconds;
      }
    }

    const updated = await this.courseRepository.update(id, {
      status: 'published',
      publishedAt: new Date(),
      totalDurationSeconds: totalDuration,
    });

    if (!updated) {
      throw new CourseNotFoundException(id);
    }

    return updated;
  }
}
