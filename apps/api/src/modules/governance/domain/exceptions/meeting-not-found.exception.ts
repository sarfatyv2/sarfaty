import { DomainException } from '@nexus/types';

export class MeetingNotFoundException extends DomainException {
  readonly code = 'MEETING_NOT_FOUND';
  readonly httpStatus = 404;

  constructor(id: string) {
    super(`Meeting not found: ${id}`);
  }
}
