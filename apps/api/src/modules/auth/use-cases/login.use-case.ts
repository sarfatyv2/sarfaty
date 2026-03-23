import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { type LoginDto } from '@nexus/validators';
import { DRIZZLE, type DrizzleDB } from '../../../database/database.module';
import { profiles } from '../../../database/schema/profiles';
import { PasswordService } from '../domain/password.service';
import { TokenService } from '../domain/token.service';
import {
  REFRESH_TOKEN_REPOSITORY,
  type RefreshTokenRepository,
} from '../domain/refresh-token.repository';
import { InvalidCredentialsException } from '../domain/exceptions/invalid-credentials.exception';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(dto: LoginDto) {
    const rows = await this.db
      .select({
        id: profiles.id,
        email: profiles.email,
        role: profiles.role,
        passwordHash: profiles.passwordHash,
      })
      .from(profiles)
      .where(eq(profiles.email, dto.email))
      .limit(1);

    const profile = rows[0];
    if (!profile?.passwordHash) {
      throw new InvalidCredentialsException();
    }

    const passwordValid = await this.passwordService.verify(profile.passwordHash, dto.password);
    if (!passwordValid) {
      throw new InvalidCredentialsException();
    }

    const accessToken = this.tokenService.signAccessToken({
      sub: profile.id,
      email: profile.email,
      role: profile.role,
    });

    const { raw: refreshTokenRaw, hash: refreshTokenHash } = this.tokenService.generateRefreshToken();
    const familyId = randomUUID();
    const expiresAt = this.tokenService.getRefreshExpiresAt();

    await this.refreshTokenRepository.create({
      userId: profile.id,
      tokenHash: refreshTokenHash,
      familyId,
      expiresAt,
    });

    const expiresAtUnix = this.tokenService.getAccessTokenExpiresAtUnix(accessToken);

    return {
      data: {
        accessToken,
        refreshToken: refreshTokenRaw,
        expiresAt: expiresAtUnix,
        user: {
          id: profile.id,
          email: profile.email,
          role: profile.role,
        },
      },
    };
  }
}
