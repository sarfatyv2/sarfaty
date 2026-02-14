import { Inject, Injectable } from '@nestjs/common';
import type { ListClientsQueryDto } from '@nexus/validators';
import { CLIENT_REPOSITORY, type ClientRepository, type PaginatedClients } from '../domain/client.repository';

@Injectable()
export class ListClientsUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: ClientRepository,
  ) {}

  async execute(query: ListClientsQueryDto): Promise<PaginatedClients> {
    return this.clientRepository.findByFilters({
      status: query.status,
      segmentId: query.segmentId,
      search: query.search,
      assignedTo: query.assignedTo,
      page: query.page,
      pageSize: query.pageSize,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }
}
