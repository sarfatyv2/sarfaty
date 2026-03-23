import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { profiles } from '../../../database/schema/profiles';
import { TokenService } from '../domain/token.service';
import {
  REFRESH_TOKEN_REPOSITORY,
  type RefreshTokenRepository,
} from '../domain/refresh-token.repository';
import { SessionExpiredException } from '../domain/exceptions/session-expired.exception';

export interface RefreshTokenContext {
  userAgent?: string | null;
  ipAddress?: string | null;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly tokenService: TokenService,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
  ) {}

  async execute(refreshTokenRaw: string, context?: RefreshTokenContext) {
    const tokenHash = this.tokenService.hashRefreshToken(refreshTokenRaw);

    const active = await this.refreshTokenRepository.findActiveByTokenHash(tokenHash);
    if (active) {
      const profileRows = await this.db
        .select({
          id: profiles.id,
          email: profiles.email,
          role: profiles.role,
        })
        .from(profiles)
        .where(eq(profiles.id, active.userId))
        .limit(1);

      const profile = profileRows[0];
      if (!profile) {
        await this.refreshTokenRepository.revokeByFamily(active.familyId);
        throw new SessionExpiredException();
      }

      await this.refreshTokenRepository.revokeById(active.id);

      const { raw: newRefreshRaw, hash: newRefreshHash } = this.tokenService.generateRefreshToken();
      const expiresAt = this.tokenService.getRefreshExpiresAt();

      await this.refreshTokenRepository.create({
        userId: active.userId,
        tokenHash: newRefreshHash,
        familyId: active.familyId,
        expiresAt,
        userAgent: context?.userAgent,
        ipAddress: context?.ipAddress,
      });

      const accessToken = this.tokenService.signAccessToken({
        sub: profile.id,
        email: profile.email,
        role: profile.role,
      });

      const expiresAtUnix = this.tokenService.getAccessTokenExpiresAtUnix(accessToken);

      return {
        data: {
          accessToken,
          refreshToken: newRefreshRaw,
          expiresAt: expiresAtUnix,
        },
      };
    }

    const revoked = await this.refreshTokenRepository.findRevokedByTokenHash(tokenHash);
    if (revoked) {
      await this.refreshTokenRepository.revokeByFamily(revoked.familyId);
    }

    throw new SessionExpiredException();
  }
}
