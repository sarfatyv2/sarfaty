import { DomainException } from '@nexus/types';

export class CourseNotPublishedException extends DomainException {
  readonly code = 'COURSE_NOT_PUBLISHED';
  readonly httpStatus = 422;

  constructor(id: string) {
    super(`Course ${id} is not published`);
  }
}
