import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { vi } from 'vitest';
import { TokenService } from './token.service';

const envMock = vi.hoisted(() => ({
  JWT_REFRESH_EXPIRES_IN: '7d',
}));

vi.mock('../../../config/env', () => ({
  env: envMock,
}));

describe('TokenService', () => {
  let jwtService: {
    sign: ReturnType<typeof vi.fn>;
    verify: ReturnType<typeof vi.fn>;
    decode: ReturnType<typeof vi.fn>;
  };
  let service: TokenService;

  beforeEach(() => {
    envMock.JWT_REFRESH_EXPIRES_IN = '7d';
    jwtService = {
      sign: vi.fn().mockReturnValue('signed-jwt'),
      verify: vi.fn().mockReturnValue({
        sub: 'user-id',
        email: 'u@example.com',
        role: 'admin',
      }),
      decode: vi.fn().mockReturnValue({ exp: 1_700_000_000 }),
    };
    service = new TokenService(jwtService as unknown as JwtService);
  });

  describe('signAccessToken', () => {
    it('should call jwtService.sign with sub, email, role', () => {
      service.signAccessToken({
        sub: 'sub-1',
        email: 'e@x.com',
        role: 'hr',
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'sub-1',
        email: 'e@x.com',
        role: 'hr',
      });
    });
  });

  describe('verifyAccessToken', () => {
    it('should return payload when JWT is valid', () => {
      const result = service.verifyAccessToken('token');
      expect(result).toEqual({
        sub: 'user-id',
        email: 'u@example.com',
        role: 'admin',
      });
    });

    it('should throw UnauthorizedException when jwtService.verify throws', () => {
      jwtService.verify.mockImplementationOnce(() => {
        throw new Error('invalid');
      });
      expect(() => service.verifyAccessToken('bad')).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when payload is missing subject', () => {
      jwtService.verify.mockReturnValueOnce({
        sub: '',
        email: 'u@example.com',
        role: 'admin',
      });
      expect(() => service.verifyAccessToken('token')).toThrow(UnauthorizedException);
    });
  });

  describe('getAccessTokenExpiresAtUnix', () => {
    it('should return exp from decoded JWT when present', () => {
      jwtService.decode.mockReturnValue({ exp: 1_700_000_000 });
      expect(service.getAccessTokenExpiresAtUnix('any')).toBe(1_700_000_000);
    });

    it('should return fallback when exp is missing', () => {
      jwtService.decode.mockReturnValue({});
      const result = service.getAccessTokenExpiresAtUnix('any');
      expect(result).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });
  });

  describe('generateRefreshToken', () => {
    it('should return raw UUID and hex SHA-256 hash of raw', () => {
      const { raw, hash } = service.generateRefreshToken();
      expect(raw).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu,
      );
      expect(hash).toBe(createHash('sha256').update(raw, 'utf8').digest('hex'));
      expect(hash).toHaveLength(64);
    });
  });

  describe('hashRefreshToken', () => {
    it('should be deterministic for the same input', () => {
      const a = service.hashRefreshToken('same-raw');
      const b = service.hashRefreshToken('same-raw');
      expect(a).toBe(b);
    });
  });

  describe('getRefreshExpiresAt', () => {
    it('should return a future date for 7d', () => {
      envMock.JWT_REFRESH_EXPIRES_IN = '7d';
      const d = service.getRefreshExpiresAt();
      expect(d.getTime()).toBeGreaterThan(Date.now() + 6 * 86_400_000);
    });

    it('should return a future date for 24h', () => {
      envMock.JWT_REFRESH_EXPIRES_IN = '24h';
      const d = service.getRefreshExpiresAt();
      expect(d.getTime()).toBeGreaterThan(Date.now() + 23 * 3_600_000);
    });

    it('should return a future date for 30m', () => {
      envMock.JWT_REFRESH_EXPIRES_IN = '30m';
      const d = service.getRefreshExpiresAt();
      expect(d.getTime()).toBeGreaterThan(Date.now() + 29 * 60_000);
    });
  });
});
