import { DomainException } from '@nexus/types';

export class CourseNotFoundException extends DomainException {
  readonly code = 'COURSE_NOT_FOUND';
  readonly httpStatus = 404;

  constructor(id: string) {
    super(`Course not found: ${id}`);
  }
}
