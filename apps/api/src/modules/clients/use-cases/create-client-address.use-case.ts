import { Inject, Injectable } from '@nestjs/common';
import { CLIENT_ADDRESS_REPOSITORY, type ClientAddressRepository } from '../domain/client-address.repository';
import { ClientAddress } from '../domain/client-address.entity';
import type { CreateClientAddressDto } from '@nexus/validators';

@Injectable()
export class CreateClientAddressUseCase {
  constructor(
    @Inject(CLIENT_ADDRESS_REPOSITORY)
    private readonly addressRepository: ClientAddressRepository,
  ) {}

  async execute(clientId: string, dto: CreateClientAddressDto) {
    const address = ClientAddress.create({
      clientId,
      useType: dto.useType ?? null,
      street: dto.street ?? null,
      number: dto.number ?? null,
      withoutNumber: dto.withoutNumber,
      complement: dto.complement ?? null,
      neighborhood: dto.neighborhood ?? null,
      zipCode: dto.zipCode ?? null,
      city: dto.city ?? null,
      state: dto.state ?? null,
      isPrimary: dto.isPrimary,
      isActive: dto.isActive,
    });
    const saved = await this.addressRepository.save(address);
    return saved.toPlainObject();
  }
}
