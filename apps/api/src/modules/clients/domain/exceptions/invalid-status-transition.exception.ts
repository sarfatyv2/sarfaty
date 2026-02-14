import { DomainException } from '@nexus/types';

export class InvalidStatusTransitionException extends DomainException {
  readonly code = 'INVALID_STATUS_TRANSITION';
  readonly httpStatus = 422;

  constructor(fromStatus: string, toStatus: string) {
    super(`Invalid status transition from '${fromStatus}' to '${toStatus}'`);
  }
}
