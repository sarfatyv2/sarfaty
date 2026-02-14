import { DomainException } from '@nexus/types';

export class UserCreationFailedException extends DomainException {
  readonly code = 'USER_CREATION_FAILED';
  readonly httpStatus = 500;

  constructor(reason: string) {
    super(`Failed to create user: ${reason}`);
  }
}
