import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLIENT_ADDRESS_REPOSITORY, type ClientAddressRepository } from '../domain/client-address.repository';
import type { UpdateClientAddressDto } from '@nexus/validators';

@Injectable()
export class UpdateClientAddressUseCase {
  constructor(
    @Inject(CLIENT_ADDRESS_REPOSITORY)
    private readonly addressRepository: ClientAddressRepository,
  ) {}

  async execute(id: string, dto: UpdateClientAddressDto) {
    const updated = await this.addressRepository.update(id, dto as Record<string, unknown>);
    if (!updated) throw new NotFoundException(`Address ${id} not found`);
    return updated.toPlainObject();
  }
}
