import { Injectable, Inject } from '@nestjs/common';
import { CLIENT_DRAWEE_REPOSITORY, type ClientDraweeRepository } from '../../cnab/domain/client-drawee.repository';
import { CLIENT_REPOSITORY, type ClientRepository } from '../../clients/domain/client.repository';

export interface DraweeClientItem {
  clientId: string;
  companyName: string;
  cnpj: string | null;
  totalTitles: number;
  totalExposure: string;
  firstOperationAt: string | null;
  lastOperationAt: string | null;
}

@Injectable()
export class ListDraweeClientsUseCase {
  constructor(
    @Inject(CLIENT_DRAWEE_REPOSITORY)
    private readonly clientDraweeRepo: ClientDraweeRepository,
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepo: ClientRepository,
  ) {}

  async execute(draweeId: string): Promise<DraweeClientItem[]> {
    const links = await this.clientDraweeRepo.findByDraweeId(draweeId);
    const results: DraweeClientItem[] = [];

    for (const link of links) {
      const client = await this.clientRepo.findById(link.clientId);
      if (!client) continue;

      results.push({
        clientId: link.clientId,
        companyName: client.companyName,
        cnpj: client.cnpj,
        totalTitles: link.totalTitles,
        totalExposure: link.totalExposure,
        firstOperationAt: link.firstOperationAt,
        lastOperationAt: link.lastOperationAt,
      });
    }

    return results;
  }
}
