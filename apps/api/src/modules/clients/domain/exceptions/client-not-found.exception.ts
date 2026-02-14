import { DomainException } from '@nexus/types';

export class ClientNotFoundException extends DomainException {
  readonly code = 'CLIENT_NOT_FOUND';
  readonly httpStatus = 404;

  constructor(id: string) {
    super(`Client not found: ${id}`);
  }
}
