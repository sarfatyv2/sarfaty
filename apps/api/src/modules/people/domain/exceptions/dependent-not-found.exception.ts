import { DomainException } from '@nexus/types';

export class DependentNotFoundException extends DomainException {
  readonly code = 'DEPENDENT_NOT_FOUND';
  readonly httpStatus = 404;

  constructor(id: string) {
    super(`Dependent with id "${id}" not found`);
  }
}
