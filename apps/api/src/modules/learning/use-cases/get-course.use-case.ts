import { Inject, Injectable } from '@nestjs/common';
import { COURSE_REPOSITORY, type CourseRepository, type CourseWithModulesAndLessons } from '../domain/course.repository';
import { CourseNotFoundException } from '../domain/exceptions/course-not-found.exception';

@Injectable()
export class GetCourseUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepository,
  ) {}

  async execute(id: string): Promise<CourseWithModulesAndLessons> {
    const result = await this.courseRepository.findByIdWithModulesAndLessons(id);
    if (!result) {
      throw new CourseNotFoundException(id);
    }
    return result;
  }
}
