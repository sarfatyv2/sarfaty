import { DomainException } from '@nexus/types';

export class AnnouncementNotFoundException extends DomainException {
  readonly code = 'ANNOUNCEMENT_NOT_FOUND';
  readonly httpStatus = 404;

  constructor(id: string) {
    super(`Announcement not found: ${id}`);
  }
}
