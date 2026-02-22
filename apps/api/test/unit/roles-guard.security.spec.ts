import { describe, expect, it, vi } from 'vitest';
import { type ExecutionContext } from '@nestjs/common';
import { RolesGuard } from '../../src/common/guards/roles.guard';

function createExecutionContext(role?: string): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({
        user: role ? { user_metadata: { role } } : undefined,
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard (security)', () => {
  it('allows access when the user role is allowed', () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(['admin']),
    };
    const guard = new RolesGuard(reflector as any);

    const canActivate = guard.canActivate(createExecutionContext('admin'));

    expect(canActivate).toBe(true);
  });

  it('blocks access when user has disallowed role', () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(['admin']),
    };
    const guard = new RolesGuard(reflector as any);

    expect(() => guard.canActivate(createExecutionContext('employee'))).toThrow(
      'Insufficient permissions',
    );
  });

  it('blocks access when no role is present', () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(['admin']),
    };
    const guard = new RolesGuard(reflector as any);

    expect(() => guard.canActivate(createExecutionContext())).toThrow(
      'Insufficient permissions',
    );
  });
});
