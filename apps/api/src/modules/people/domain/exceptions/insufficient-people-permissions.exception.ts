import { DomainException } from '@nexus/types';

export class InsufficientPeoplePermissionsException extends DomainException {
  readonly code = 'INSUFFICIENT_PEOPLE_PERMISSIONS';
  readonly httpStatus = 403;

  constructor(message = 'Insufficient permissions for this People operation') {
    super(message);
  }
}
