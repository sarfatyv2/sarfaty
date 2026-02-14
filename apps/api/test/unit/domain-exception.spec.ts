import { describe, it, expect } from 'vitest';
import { DomainException } from '@nexus/types';

class TestException extends DomainException {
  readonly code = 'TEST_ERROR';
  readonly httpStatus = 400;

  constructor(message: string) {
    super(message);
  }
}

class NotFoundTestException extends DomainException {
  readonly code = 'NOT_FOUND';
  readonly httpStatus = 404;

  constructor() {
    super('Resource not found', { resource: 'test' });
  }
}

describe('DomainException', () => {
  it('should create exception with code and httpStatus', () => {
    const error = new TestException('Something went wrong');

    expect(error.message).toBe('Something went wrong');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.httpStatus).toBe(400);
    expect(error.name).toBe('TestException');
  });

  it('should support metadata', () => {
    const error = new NotFoundTestException();

    expect(error.code).toBe('NOT_FOUND');
    expect(error.httpStatus).toBe(404);
    expect(error.metadata).toEqual({ resource: 'test' });
  });

  it('should be instanceof Error', () => {
    const error = new TestException('test');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainException);
  });
});
