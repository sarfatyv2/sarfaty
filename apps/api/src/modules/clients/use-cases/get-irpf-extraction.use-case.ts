import { Inject, Injectable } from '@nestjs/common';
import {
  IRPF_EXTRACTION_REPOSITORY,
  type IrpfExtractionRepository,
} from '../domain/irpf-extraction.repository';
import type { IrpfExtractionProps } from '../domain/irpf-extraction.entity';
import { ClientNotFoundException } from '../domain/exceptions/client-not-found.exception';
import { CLIENT_REPOSITORY, type ClientRepository } from '../domain/client.repository';

@Injectable()
export class GetIrpfExtractionUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: ClientRepository,
    @Inject(IRPF_EXTRACTION_REPOSITORY)
    private readonly extractionRepo: IrpfExtractionRepository,
  ) {}

  async getByClient(clientId: string): Promise<IrpfExtractionProps[]> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) throw new ClientNotFoundException(clientId);

    return this.extractionRepo.findByClientId(clientId);
  }

  async getById(clientId: string, extractionId: string): Promise<IrpfExtractionProps> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) throw new ClientNotFoundException(clientId);

    const extraction = await this.extractionRepo.findById(extractionId);
    if (extraction?.clientId !== clientId) {
      throw new Error(`IRPF extraction ${extractionId} not found for client ${clientId}`);
    }

    return extraction;
  }
}
