import { Inject, Injectable } from '@nestjs/common';
import {
  FATURAMENTO_EXTRACTION_REPOSITORY,
  type FaturamentoExtractionRepository,
} from '../domain/faturamento-extraction.repository';
import type { FaturamentoExtractionProps } from '../domain/faturamento-extraction.entity';
import { ClientNotFoundException } from '../domain/exceptions/client-not-found.exception';
import { CLIENT_REPOSITORY, type ClientRepository } from '../domain/client.repository';

@Injectable()
export class GetFaturamentoExtractionUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: ClientRepository,
    @Inject(FATURAMENTO_EXTRACTION_REPOSITORY)
    private readonly extractionRepo: FaturamentoExtractionRepository,
  ) {}

  async getByClient(clientId: string): Promise<FaturamentoExtractionProps[]> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) throw new ClientNotFoundException(clientId);

    return this.extractionRepo.findByClientId(clientId);
  }

  async getById(clientId: string, extractionId: string): Promise<FaturamentoExtractionProps> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) throw new ClientNotFoundException(clientId);

    const extraction = await this.extractionRepo.findById(extractionId);
    if (extraction?.clientId !== clientId) {
      throw new Error(`Faturamento extraction ${extractionId} not found for client ${clientId}`);
    }

    return extraction;
  }
}
