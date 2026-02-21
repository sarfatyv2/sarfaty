import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLIENT_CONTACT_REPOSITORY, type ClientContactRepository } from '../domain/client-contact.repository';

@Injectable()
export class DeleteClientContactUseCase {
  constructor(
    @Inject(CLIENT_CONTACT_REPOSITORY)
    private readonly contactRepository: ClientContactRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const contact = await this.contactRepository.findById(id);
    if (!contact) throw new NotFoundException(`Contact ${id} not found`);
    await this.contactRepository.delete(id);
  }
}
