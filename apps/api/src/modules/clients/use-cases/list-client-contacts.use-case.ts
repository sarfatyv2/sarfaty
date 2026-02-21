import { Inject, Injectable } from '@nestjs/common';
import { CLIENT_CONTACT_REPOSITORY, type ClientContactRepository } from '../domain/client-contact.repository';

@Injectable()
export class ListClientContactsUseCase {
  constructor(
    @Inject(CLIENT_CONTACT_REPOSITORY)
    private readonly contactRepository: ClientContactRepository,
  ) {}

  async execute(clientId: string) {
    const contacts = await this.contactRepository.findAllByClientId(clientId);
    return contacts.map((c) => c.toPlainObject());
  }
}
