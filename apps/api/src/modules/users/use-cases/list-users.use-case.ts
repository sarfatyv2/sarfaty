import { Inject, Injectable } from '@nestjs/common';
import type { ListUsersQueryDto } from '../dto/list-users-query.dto';
import { USER_REPOSITORY, type UserRepository, type PaginatedUsers } from '../domain/user.repository';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(query: ListUsersQueryDto): Promise<PaginatedUsers> {
    return this.userRepository.findByFilters({
      role: query.role,
      isActive: query.isActive,
      search: query.search,
      page: query.page,
      pageSize: query.pageSize,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }
}
