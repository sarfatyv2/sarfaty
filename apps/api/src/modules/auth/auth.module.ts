import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { LoginUseCase } from './use-cases/login.use-case';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case';
import { GetProfileUseCase } from './use-cases/get-profile.use-case';

@Module({
  controllers: [AuthController],
  providers: [LoginUseCase, RefreshTokenUseCase, GetProfileUseCase],
})
export class AuthModule {}
