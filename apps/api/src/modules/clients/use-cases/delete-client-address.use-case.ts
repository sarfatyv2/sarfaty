import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLIENT_ADDRESS_REPOSITORY, type ClientAddressRepository } from '../domain/client-address.repository';

@Injectable()
export class DeleteClientAddressUseCase {
  constructor(
    @Inject(CLIENT_ADDRESS_REPOSITORY)
    private readonly addressRepository: ClientAddressRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const address = await this.addressRepository.findById(id);
    if (!address) throw new NotFoundException(`Address ${id} not found`);
    await this.addressRepository.delete(id);
  }
}
