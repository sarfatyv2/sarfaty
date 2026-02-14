import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { ListUsersUseCase } from './use-cases/list-users.use-case';
import { SupabaseAuthAdapter } from './infra/supabase-auth.adapter';
import { DrizzleUserRepository } from './infra/drizzle-user.repository';
import { USER_REPOSITORY } from './domain/user.repository';

@Module({
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    ListUsersUseCase,
    SupabaseAuthAdapter,
    { provide: USER_REPOSITORY, useClass: DrizzleUserRepository },
  ],
})
export class UsersModule {}
