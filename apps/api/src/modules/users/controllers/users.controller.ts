import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequireActions } from '../../../common/decorators/require-actions.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Auditable } from '../../../common/decorators/auditable.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { createUserSchema, type CreateUserDto } from '../dto/create-user.dto';
import { listUsersQuerySchema, type ListUsersQueryDto } from '../dto/list-users-query.dto';
import { CreateUserUseCase } from '../use-cases/create-user.use-case';
import { ListUsersUseCase } from '../use-cases/list-users.use-case';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
  ) {}

  @Post()
  @RequireActions('create_user')
  @Auditable({ action: 'user.create', entity: 'user' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(createUserSchema)) dto: CreateUserDto,
  ) {
    const user = await this.createUserUseCase.execute(dto);
    return { data: user };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('hr', 'dp', 'hr_admin', 'admin')
  async list(
    @Query(new ZodValidationPipe(listUsersQuerySchema)) query: ListUsersQueryDto,
  ) {
    const result = await this.listUsersUseCase.execute(query);
    return { data: result.users, pagination: result.pagination };
  }
}
