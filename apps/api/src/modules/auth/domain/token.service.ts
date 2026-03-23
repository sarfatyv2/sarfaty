import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'crypto';
import { env } from '../../../config/env';
import type { JwtAccessPayload } from './jwt-payload';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  signAccessToken(payload: JwtAccessPayload): string {
    return this.jwtService.sign({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    });
  }

  verifyAccessToken(token: string): JwtAccessPayload {
    try {
      const decoded = this.jwtService.verify<JwtAccessPayload & { iat: number; exp: number }>(token);
      if (!decoded.sub || !decoded.email || !decoded.role) {
        throw new UnauthorizedException('Invalid token payload');
      }
      return { sub: decoded.sub, email: decoded.email, role: decoded.role };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  getAccessTokenExpiresAtUnix(accessToken: string): number {
    const decoded = this.jwtService.decode<{ exp?: number }>(accessToken);
    if (!decoded?.exp) {
      return Math.floor(Date.now() / 1000) + 900;
    }
    return decoded.exp;
  }

  generateRefreshToken(): { raw: string; hash: string } {
    const raw = randomUUID();
    return { raw, hash: this.hashRefreshToken(raw) };
  }

  hashRefreshToken(raw: string): string {
    return createHash('sha256').update(raw, 'utf8').digest('hex');
  }

  getRefreshExpiresAt(): Date {
    const value = env.JWT_REFRESH_EXPIRES_IN.trim();
    const match = /^(\d+)([smhd])$/u.exec(value);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    const amount = Number(match[1]);
    const unit = match[2] as 's' | 'm' | 'h' | 'd';
    const multipliers: Record<'s' | 'm' | 'h' | 'd', number> = {
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };
    const ms = amount * (multipliers[unit] ?? 86_400_000);
    return new Date(Date.now() + ms);
  }
}
