import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './controllers/users.controller';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { ListUsersUseCase } from './use-cases/list-users.use-case';
import { LocalAuthAdapter } from './infra/local-auth.adapter';
import { DrizzleUserRepository } from './infra/drizzle-user.repository';
import { USER_REPOSITORY } from './domain/user.repository';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    ListUsersUseCase,
    LocalAuthAdapter,
    { provide: USER_REPOSITORY, useClass: DrizzleUserRepository },
  ],
})
export class UsersModule {}
