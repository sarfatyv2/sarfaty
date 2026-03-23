import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../database/database.module', () => ({
  DRIZZLE: Symbol('DRIZZLE'),
}));

import { RefreshTokenUseCase } from './refresh-token.use-case';
import { SessionExpiredException } from '../domain/exceptions/session-expired.exception';

describe('RefreshTokenUseCase', () => {
  const activeRecord = {
    id: 'rt-1',
    userId: 'user-1',
    tokenHash: 'hash',
    familyId: 'fam-1',
    expiresAt: new Date(Date.now() + 86_400_000),
    revokedAt: null,
  };

  const revokedRecord = {
    id: 'rt-old',
    userId: 'user-1',
    tokenHash: 'hash',
    familyId: 'fam-1',
    expiresAt: new Date(),
    revokedAt: new Date(),
  };

  const profileRow = {
    id: 'user-1',
    email: 'u@sarfaty.com',
    role: 'admin',
  };

  let tokenService: {
    hashRefreshToken: ReturnType<typeof vi.fn>;
    generateRefreshToken: ReturnType<typeof vi.fn>;
    getRefreshExpiresAt: ReturnType<typeof vi.fn>;
    signAccessToken: ReturnType<typeof vi.fn>;
    getAccessTokenExpiresAtUnix: ReturnType<typeof vi.fn>;
  };
  let refreshTokenRepository: {
    findActiveByTokenHash: ReturnType<typeof vi.fn>;
    findRevokedByTokenHash: ReturnType<typeof vi.fn>;
    revokeById: ReturnType<typeof vi.fn>;
    revokeByFamily: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let db: { select: ReturnType<typeof vi.fn> };
  let useCase: RefreshTokenUseCase;

  function mockProfileRows(rows: unknown[]) {
    const limit = vi.fn().mockResolvedValue(rows);
    const where = vi.fn().mockReturnValue({ limit });
    const from = vi.fn().mockReturnValue({ where });
    db.select = vi.fn().mockReturnValue({ from });
  }

  beforeEach(() => {
    tokenService = {
      hashRefreshToken: vi.fn().mockReturnValue('hashed-token'),
      generateRefreshToken: vi.fn().mockReturnValue({
        raw: 'new-refresh-raw',
        hash: 'new-refresh-hash',
      }),
      getRefreshExpiresAt: vi.fn().mockReturnValue(new Date('2026-01-01T00:00:00.000Z')),
      signAccessToken: vi.fn().mockReturnValue('new-access-token'),
      getAccessTokenExpiresAtUnix: vi.fn().mockReturnValue(1_700_000_001),
    };

    refreshTokenRepository = {
      findActiveByTokenHash: vi.fn(),
      findRevokedByTokenHash: vi.fn(),
      revokeById: vi.fn().mockResolvedValue(undefined),
      revokeByFamily: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue(undefined),
    };

    db = { select: vi.fn() };

    useCase = new RefreshTokenUseCase(
      tokenService as never,
      refreshTokenRepository as never,
      db as never,
    );
  });

  it('should rotate tokens when active refresh token is valid', async () => {
    refreshTokenRepository.findActiveByTokenHash.mockResolvedValue(activeRecord);
    mockProfileRows([profileRow]);

    const result = await useCase.execute('raw-refresh-token');

    expect(tokenService.hashRefreshToken).toHaveBeenCalledWith('raw-refresh-token');
    expect(refreshTokenRepository.revokeById).toHaveBeenCalledWith(activeRecord.id);
    expect(refreshTokenRepository.create).toHaveBeenCalledWith({
      userId: activeRecord.userId,
      tokenHash: 'new-refresh-hash',
      familyId: activeRecord.familyId,
      expiresAt: new Date('2026-01-01T00:00:00.000Z'),
      userAgent: undefined,
      ipAddress: undefined,
    });
    expect(result.data).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-raw',
      expiresAt: 1_700_000_001,
    });
  });

  it('should pass context to refresh token create', async () => {
    refreshTokenRepository.findActiveByTokenHash.mockResolvedValue(activeRecord);
    mockProfileRows([profileRow]);

    await useCase.execute('raw', {
      userAgent: 'Mozilla/5.0',
      ipAddress: '192.168.1.1',
    });

    expect(refreshTokenRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
      }),
    );
  });

  it('should revoke family and throw when profile is missing', async () => {
    refreshTokenRepository.findActiveByTokenHash.mockResolvedValue(activeRecord);
    mockProfileRows([]);

    await expect(useCase.execute('raw')).rejects.toBeInstanceOf(SessionExpiredException);

    expect(refreshTokenRepository.revokeByFamily).toHaveBeenCalledWith(activeRecord.familyId);
    expect(refreshTokenRepository.revokeById).not.toHaveBeenCalled();
  });

  it('should revoke family on reuse of revoked token', async () => {
    refreshTokenRepository.findActiveByTokenHash.mockResolvedValue(null);
    refreshTokenRepository.findRevokedByTokenHash.mockResolvedValue(revokedRecord);

    await expect(useCase.execute('stolen-old-token')).rejects.toBeInstanceOf(SessionExpiredException);

    expect(refreshTokenRepository.revokeByFamily).toHaveBeenCalledWith(revokedRecord.familyId);
  });

  it('should throw when token is neither active nor revoked', async () => {
    refreshTokenRepository.findActiveByTokenHash.mockResolvedValue(null);
    refreshTokenRepository.findRevokedByTokenHash.mockResolvedValue(null);

    await expect(useCase.execute('unknown')).rejects.toBeInstanceOf(SessionExpiredException);

    expect(refreshTokenRepository.revokeByFamily).not.toHaveBeenCalled();
  });
});
