import { DomainException } from '@nexus/types';

export class AlreadyEnrolledException extends DomainException {
  readonly code = 'ALREADY_ENROLLED';
  readonly httpStatus = 409;

  constructor(courseId: string, collaboratorId: string) {
    super(`Collaborator ${collaboratorId} is already enrolled in course ${courseId}`);
  }
}
