import { DomainException } from '@nexus/types';

export class GoalAlreadyExistsException extends DomainException {
  readonly code = 'GOAL_ALREADY_EXISTS';
  readonly httpStatus = 409;

  constructor(periodYear: number, periodMonth: number) {
    super(`A goal already exists for ${periodMonth}/${periodYear}`);
  }
}
