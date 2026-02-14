import { DomainException } from '@nexus/types';

export class QuizFailedException extends DomainException {
  readonly code = 'QUIZ_FAILED';
  readonly httpStatus = 422;

  constructor(score: number, minScore: number) {
    super(`Quiz score ${score}% is below the minimum required ${minScore}%`, {
      score,
      minScore,
    });
  }
}
