import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../database/database.module', () => ({
  DRIZZLE: Symbol('DRIZZLE'),
}));

import { LoginUseCase } from './login.use-case';
import { InvalidCredentialsException } from '../domain/exceptions/invalid-credentials.exception';

describe('LoginUseCase', () => {
  const profileRow = {
    id: 'profile-uuid-1',
    email: 'user@sarfaty.com',
    role: 'admin',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$hash',
  };

  let db: { select: ReturnType<typeof vi.fn> };
  let passwordService: { verify: ReturnType<typeof vi.fn> };
  let tokenService: {
    signAccessToken: ReturnType<typeof vi.fn>;
    generateRefreshToken: ReturnType<typeof vi.fn>;
    getRefreshExpiresAt: ReturnType<typeof vi.fn>;
    getAccessTokenExpiresAtUnix: ReturnType<typeof vi.fn>;
  };
  let refreshTokenRepository: { create: ReturnType<typeof vi.fn> };
  let useCase: LoginUseCase;

  function mockDbRows(rows: unknown[]) {
    const limit = vi.fn().mockResolvedValue(rows);
    const where = vi.fn().mockReturnValue({ limit });
    const from = vi.fn().mockReturnValue({ where });
    db.select = vi.fn().mockReturnValue({ from });
  }

  beforeEach(() => {
    db = { select: vi.fn() };

    passwordService = {
      verify: vi.fn(),
    };

    const expiresAt = new Date('2025-12-31T00:00:00.000Z');
    tokenService = {
      signAccessToken: vi.fn().mockReturnValue('access-token-jwt'),
      generateRefreshToken: vi.fn().mockReturnValue({
        raw: 'refresh-raw-token',
        hash: 'refresh-hash-hex',
      }),
      getRefreshExpiresAt: vi.fn().mockReturnValue(expiresAt),
      getAccessTokenExpiresAtUnix: vi.fn().mockReturnValue(1_700_000_000),
    };

    refreshTokenRepository = {
      create: vi.fn().mockResolvedValue(undefined),
    };

    useCase = new LoginUseCase(
      db as never,
      passwordService as never,
      tokenService as never,
      refreshTokenRepository as never,
    );
  });

  it('should return tokens and user when credentials are valid', async () => {
    mockDbRows([profileRow]);
    passwordService.verify.mockResolvedValue(true);

    const result = await useCase.execute({
      email: 'user@sarfaty.com',
      password: 'plain-password',
    });

    expect(result.data).toEqual({
      accessToken: 'access-token-jwt',
      refreshToken: 'refresh-raw-token',
      expiresAt: 1_700_000_000,
      user: {
        id: profileRow.id,
        email: profileRow.email,
        role: profileRow.role,
      },
    });

    expect(passwordService.verify).toHaveBeenCalledWith(profileRow.passwordHash, 'plain-password');
    expect(tokenService.signAccessToken).toHaveBeenCalledWith({
      sub: profileRow.id,
      email: profileRow.email,
      role: profileRow.role,
    });
    expect(refreshTokenRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: profileRow.id,
        tokenHash: 'refresh-hash-hex',
        expiresAt: new Date('2025-12-31T00:00:00.000Z'),
      }),
    );
    const createPayload = refreshTokenRepository.create.mock.calls[0][0];
    expect(createPayload.familyId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu,
    );
  });

  it('should throw InvalidCredentialsException when email is not found', async () => {
    mockDbRows([]);

    await expect(
      useCase.execute({ email: 'missing@sarfaty.com', password: 'x' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsException);

    expect(passwordService.verify).not.toHaveBeenCalled();
  });

  it('should throw InvalidCredentialsException when password_hash is null', async () => {
    mockDbRows([
      {
        id: profileRow.id,
        email: profileRow.email,
        role: profileRow.role,
        passwordHash: null,
      },
    ]);

    await expect(
      useCase.execute({ email: profileRow.email, password: 'x' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsException);

    expect(passwordService.verify).not.toHaveBeenCalled();
  });

  it('should throw InvalidCredentialsException when password is wrong', async () => {
    mockDbRows([profileRow]);
    passwordService.verify.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: profileRow.email, password: 'wrong' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsException);

    expect(passwordService.verify).toHaveBeenCalled();
    expect(tokenService.signAccessToken).not.toHaveBeenCalled();
  });
});
