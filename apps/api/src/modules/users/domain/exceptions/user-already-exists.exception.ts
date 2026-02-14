import { DomainException } from '@nexus/types';

export class UserAlreadyExistsException extends DomainException {
  readonly code = 'USER_ALREADY_EXISTS';
  readonly httpStatus = 409;

  constructor(email: string) {
    super(`User with email "${email}" already exists`);
  }
}
