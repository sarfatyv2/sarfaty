import { DomainException } from '@nexus/types';

export class MemberAlreadyExistsException extends DomainException {
  readonly code = 'MEMBER_ALREADY_EXISTS';
  readonly httpStatus = 409;

  constructor(committeeId: string, profileId: string) {
    super(`Profile ${profileId} is already a member of committee ${committeeId}`);
  }
}
