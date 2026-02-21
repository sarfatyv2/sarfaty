import { Inject, Injectable } from '@nestjs/common';
import { CLIENT_ADDRESS_REPOSITORY, type ClientAddressRepository } from '../domain/client-address.repository';

@Injectable()
export class ListClientAddressesUseCase {
  constructor(
    @Inject(CLIENT_ADDRESS_REPOSITORY)
    private readonly addressRepository: ClientAddressRepository,
  ) {}

  async execute(clientId: string) {
    const addresses = await this.addressRepository.findAllByClientId(clientId);
    return addresses.map((a) => a.toPlainObject());
  }
}
