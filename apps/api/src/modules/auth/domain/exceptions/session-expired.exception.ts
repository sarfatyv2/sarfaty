import { DomainException } from '@nexus/types';

export class SessionExpiredException extends DomainException {
  readonly code = 'SESSION_EXPIRED';
  readonly httpStatus = 401;

  constructor() {
    super('Session expired. Please login again.');
  }
}
