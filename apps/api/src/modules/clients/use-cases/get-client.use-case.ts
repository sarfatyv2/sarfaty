import { Inject, Injectable } from '@nestjs/common';
import type { Client } from '../domain/client.entity';
import { CLIENT_REPOSITORY, type ClientRepository } from '../domain/client.repository';
import { ClientNotFoundException } from '../domain/exceptions/client-not-found.exception';

@Injectable()
export class GetClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: ClientRepository,
  ) {}

  async execute(id: string): Promise<Client> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new ClientNotFoundException(id);
    }
    return client;
  }
}
