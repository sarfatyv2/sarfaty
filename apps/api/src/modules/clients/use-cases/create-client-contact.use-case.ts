import { Inject, Injectable } from '@nestjs/common';
import { CLIENT_CONTACT_REPOSITORY, type ClientContactRepository } from '../domain/client-contact.repository';
import { ClientContact } from '../domain/client-contact.entity';
import type { CreateClientContactDto } from '@nexus/validators';

@Injectable()
export class CreateClientContactUseCase {
  constructor(
    @Inject(CLIENT_CONTACT_REPOSITORY)
    private readonly contactRepository: ClientContactRepository,
  ) {}

  async execute(clientId: string, dto: CreateClientContactDto) {
    const contact = ClientContact.create({
      clientId,
      contactName: dto.contactName ?? null,
      useType: dto.useType ?? null,
      email: dto.email ?? null,
      emailSecondary: dto.emailSecondary ?? null,
      phone: dto.phone ?? null,
      phoneMobile: dto.phoneMobile ?? null,
      phoneSms: dto.phoneSms ?? null,
      whatsapp: dto.whatsapp,
      homepage: dto.homepage ?? null,
      notes: dto.notes ?? null,
      isPrimary: dto.isPrimary,
      isActive: dto.isActive,
    });
    const saved = await this.contactRepository.save(contact);
    return saved.toPlainObject();
  }
}
