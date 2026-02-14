import { Inject, Injectable } from '@nestjs/common';
import type { CreateClientDto } from '@nexus/validators';
import { Client } from '../domain/client.entity';
import { CLIENT_REPOSITORY, type ClientRepository } from '../domain/client.repository';
import { CnpjAlreadyExistsException } from '../domain/exceptions/cnpj-already-exists.exception';

export interface CreateClientInput {
  dto: CreateClientDto;
  assignedTo: string;
  teamId: string | null;
  regionId: string | null;
}

@Injectable()
export class CreateClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: ClientRepository,
  ) {}

  async execute(input: CreateClientInput): Promise<Client> {
    const existingClient = await this.clientRepository.findByCnpj(
      input.dto.cnpj.replace(/\D/g, ''),
    );
    if (existingClient) {
      throw new CnpjAlreadyExistsException(input.dto.cnpj);
    }

    const client = Client.create({
      companyName: input.dto.companyName,
      cnpj: input.dto.cnpj.replace(/\D/g, ''),
      tradeName: input.dto.tradeName ?? null,
      segmentId: input.dto.segmentId,
      phone: input.dto.phone,
      email: input.dto.email,
      addressStreet: input.dto.addressStreet ?? null,
      addressNumber: input.dto.addressNumber ?? null,
      addressComplement: input.dto.addressComplement ?? null,
      addressNeighborhood: input.dto.addressNeighborhood ?? null,
      addressCity: input.dto.addressCity ?? null,
      addressState: input.dto.addressState ?? null,
      addressZip: input.dto.addressZip ?? null,
      creditProductId: input.dto.creditProductId,
      requestedAmount: input.dto.requestedAmount?.toString() ?? null,
      hasGuarantees: false,
      isJudicialRecovery: false,
      workingCapitalNotes: null,
      assignedTo: input.assignedTo,
      teamId: input.teamId,
      regionId: input.regionId,
      cnpjStatus: null,
      cnpjValidatedAt: null,
    });

    return this.clientRepository.save(client);
  }
}
