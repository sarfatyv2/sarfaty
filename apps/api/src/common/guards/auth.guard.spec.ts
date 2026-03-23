import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthGuard } from './auth.guard';

function createExecutionContext(authorization?: string) {
  const request: {
    headers: Record<string, string | undefined>;
    user?: { id: string; email: string; user_metadata: { role: string } };
  } = { headers: {} };
  if (authorization !== undefined) {
    request.headers.authorization = authorization;
  }
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  };
  return { context: context as ExecutionContext, request };
}

describe('AuthGuard', () => {
  let reflector: { getAllAndOverride: ReturnType<typeof vi.fn> };
  let tokenService: { verifyAccessToken: ReturnType<typeof vi.fn> };
  let guard: AuthGuard;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(false),
    };
    tokenService = {
      verifyAccessToken: vi.fn().mockReturnValue({
        sub: 'user-id',
        email: 'user@sarfaty.com',
        role: 'admin',
      }),
    };
    guard = new AuthGuard(reflector as never, tokenService as never);
  });

  it('should return true for @Public routes without verifying token', async () => {
    reflector.getAllAndOverride.mockImplementation((key: string) => {
      if (key === IS_PUBLIC_KEY) return true;
      return false;
    });
    const { context } = createExecutionContext();

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(tokenService.verifyAccessToken).not.toHaveBeenCalled();
  });

  it('should populate request.user when Bearer token is valid', async () => {
    const { context, request } = createExecutionContext('Bearer valid.jwt.token');

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(tokenService.verifyAccessToken).toHaveBeenCalledWith('valid.jwt.token');
    expect(request.user).toEqual({
      id: 'user-id',
      email: 'user@sarfaty.com',
      user_metadata: { role: 'admin' },
    });
  });

  it('should throw when Authorization header is missing', async () => {
    const { context } = createExecutionContext();

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(tokenService.verifyAccessToken).not.toHaveBeenCalled();
  });

  it('should throw when header does not start with Bearer ', async () => {
    const { context } = createExecutionContext('Basic xyz');

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(tokenService.verifyAccessToken).not.toHaveBeenCalled();
  });

  it('should rethrow UnauthorizedException from tokenService.verifyAccessToken', async () => {
    const specific = new UnauthorizedException('Custom');
    tokenService.verifyAccessToken.mockImplementationOnce(() => {
      throw specific;
    });
    const { context } = createExecutionContext('Bearer bad');

    await expect(guard.canActivate(context)).rejects.toBe(specific);
  });

  it('should wrap non-Unauthorized errors from verifyAccessToken', async () => {
    tokenService.verifyAccessToken.mockImplementationOnce(() => {
      throw new Error('network');
    });
    const { context } = createExecutionContext('Bearer bad');

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      response: expect.objectContaining({
        message: 'Invalid or expired token',
      }),
    });
  });
});
