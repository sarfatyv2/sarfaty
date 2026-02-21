import { DomainException } from '@nexus/types';

export class GoalNotFoundException extends DomainException {
  readonly code = 'GOAL_NOT_FOUND';
  readonly httpStatus = 404;

  constructor(id: string) {
    super(`Goal not found: ${id}`);
  }
}
