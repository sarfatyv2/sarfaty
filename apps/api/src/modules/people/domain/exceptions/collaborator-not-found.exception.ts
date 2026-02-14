import { DomainException } from '@nexus/types';

export class CollaboratorNotFoundException extends DomainException {
  readonly code = 'COLLABORATOR_NOT_FOUND';
  readonly httpStatus = 404;

  constructor(id: string) {
    super(`Collaborator with id "${id}" not found`);
  }
}
