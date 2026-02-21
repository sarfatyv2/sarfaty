import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CLIENT_CONTACT_REPOSITORY, type ClientContactRepository } from '../domain/client-contact.repository';
import type { UpdateClientContactDto } from '@nexus/validators';

@Injectable()
export class UpdateClientContactUseCase {
  constructor(
    @Inject(CLIENT_CONTACT_REPOSITORY)
    private readonly contactRepository: ClientContactRepository,
  ) {}

  async execute(id: string, dto: UpdateClientContactDto) {
    const updated = await this.contactRepository.update(id, dto as Record<string, unknown>);
    if (!updated) throw new NotFoundException(`Contact ${id} not found`);
    return updated.toPlainObject();
  }
}
