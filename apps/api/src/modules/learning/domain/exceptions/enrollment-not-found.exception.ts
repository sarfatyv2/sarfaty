import { DomainException } from '@nexus/types';

export class EnrollmentNotFoundException extends DomainException {
  readonly code = 'ENROLLMENT_NOT_FOUND';
  readonly httpStatus = 404;

  constructor(id: string) {
    super(`Enrollment not found: ${id}`);
  }
}
