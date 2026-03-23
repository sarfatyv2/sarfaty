import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { env } from '../../config/env';
import { AuthController } from './controllers/auth.controller';
import { LoginUseCase } from './use-cases/login.use-case';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case';
import { GetProfileUseCase } from './use-cases/get-profile.use-case';
import { PasswordService } from './domain/password.service';
import { TokenService } from './domain/token.service';
import { REFRESH_TOKEN_REPOSITORY } from './domain/refresh-token.repository';
import { DrizzleRefreshTokenRepository } from './infra/drizzle-refresh-token.repository';

@Module({
  imports: [
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    PasswordService,
    TokenService,
    { provide: REFRESH_TOKEN_REPOSITORY, useClass: DrizzleRefreshTokenRepository },
    LoginUseCase,
    RefreshTokenUseCase,
    GetProfileUseCase,
  ],
  exports: [JwtModule, TokenService, PasswordService],
})
export class AuthModule {}
