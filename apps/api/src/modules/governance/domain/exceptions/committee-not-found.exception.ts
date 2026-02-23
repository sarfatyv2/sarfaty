import { DomainException } from '@nexus/types';

export class CommitteeNotFoundException extends DomainException {
  readonly code = 'COMMITTEE_NOT_FOUND';
  readonly httpStatus = 404;

  constructor(id: string) {
    super(`Committee not found: ${id}`);
  }
}
