import { Inject, Injectable } from '@nestjs/common';
import { CNAB_OPERATION_REPOSITORY, type CnabOperationRepository } from '../domain/cnab-operation.repository';

export interface ListCnabOperationsInput {
  clientId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class ListCnabOperationsUseCase {
  constructor(
    @Inject(CNAB_OPERATION_REPOSITORY)
    private readonly operationRepo: CnabOperationRepository,
  ) {}

  async execute(input: ListCnabOperationsInput) {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;

    return this.operationRepo.findByFilters({
      clientId: input.clientId,
      status: input.status,
      page,
      pageSize,
    });
  }
}
