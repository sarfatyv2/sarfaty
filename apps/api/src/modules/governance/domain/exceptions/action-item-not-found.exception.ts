import { DomainException } from '@nexus/types';

export class ActionItemNotFoundException extends DomainException {
  readonly code = 'ACTION_ITEM_NOT_FOUND';
  readonly httpStatus = 404;

  constructor(id: string) {
    super(`Action item not found: ${id}`);
  }
}
