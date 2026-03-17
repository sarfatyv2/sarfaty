import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CLIENT_ADDRESS_REPOSITORY, type ClientAddressRepository } from '../domain/client-address.repository';
import { CLIENT_CONTACT_REPOSITORY, type ClientContactRepository } from '../domain/client-contact.repository';
import { CLIENT_AUTHORIZED_PERSON_REPOSITORY, type ClientAuthorizedPersonRepository } from '../domain/client-authorized-person.repository';
import { ClientAddress } from '../domain/client-address.entity';
import { ClientContact } from '../domain/client-contact.entity';
import { ClientAuthorizedPerson } from '../domain/client-authorized-person.entity';
import { PartnerCompanyDetectedEvent } from '../../notifications/domain/events/client-events';

export interface BureauPartnerData {
  fullName: string;
  cpf: string | null;
  cnpj: string | null;
  authorizationType: string;
  phone: string | null;
  email: string | null;
  joinedAt: Date | null;
  mandateEndAt: Date | null;
  role: string | null;
  participationPercentage: string | null;
  capitalTotalValue: string | null;
  restrictionSign: string | null;
}

export interface BureauEnrichmentData {
  address?: {
    street: string | null;
    number: string | null;
    complement: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
  };
  contact?: {
    phone: string | null;
    email: string | null;
  };
  partners?: BureauPartnerData[];
}

export interface EnrichClientFromBureauInput {
  clientId: string;
  source: string;
  data: BureauEnrichmentData;
}

@Injectable()
export class EnrichClientFromBureauUseCase {
  private readonly logger = new Logger(EnrichClientFromBureauUseCase.name);

  constructor(
    @Inject(CLIENT_ADDRESS_REPOSITORY)
    private readonly addressRepository: ClientAddressRepository,
    @Inject(CLIENT_CONTACT_REPOSITORY)
    private readonly contactRepository: ClientContactRepository,
    @Inject(CLIENT_AUTHORIZED_PERSON_REPOSITORY)
    private readonly authorizedPersonRepository: ClientAuthorizedPersonRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(input: EnrichClientFromBureauInput): Promise<void> {
    const { clientId, source, data } = input;
    const now = new Date();

    await Promise.allSettled([
      data.address ? this.upsertAddress(clientId, source, data.address, now) : Promise.resolve(),
      data.contact ? this.upsertContact(clientId, source, data.contact, now) : Promise.resolve(),
      data.partners?.length ? this.upsertPartners(clientId, source, data.partners, now) : Promise.resolve(),
    ]);
  }

  private async upsertAddress(
    clientId: string,
    source: string,
    addressData: NonNullable<BureauEnrichmentData['address']>,
    queriedAt: Date,
  ): Promise<void> {
    const hasData = Object.values(addressData).some((v) => v != null && v !== '');
    if (!hasData) {
      this.logger.debug(`No address data from ${source} for client ${clientId}, skipping`);
      return;
    }

    try {
      const existing = await this.addressRepository.findByClientAndSource(clientId, source);

      if (existing) {
        await this.addressRepository.update(existing.id, {
          street: addressData.street,
          number: addressData.number,
          complement: addressData.complement,
          neighborhood: addressData.neighborhood,
          city: addressData.city,
          state: addressData.state,
          zipCode: addressData.zipCode,
          sourceQueriedAt: queriedAt,
        });
        this.logger.debug(`Updated ${source} address for client ${clientId}`);
      } else {
        const address = ClientAddress.create({
          clientId,
          useType: 'commercial',
          street: addressData.street,
          number: addressData.number,
          withoutNumber: false,
          complement: addressData.complement,
          neighborhood: addressData.neighborhood,
          zipCode: addressData.zipCode,
          city: addressData.city,
          state: addressData.state,
          source,
          sourceQueriedAt: queriedAt,
          isPrimary: false,
          isActive: true,
        });
        await this.addressRepository.save(address);
        this.logger.debug(`Created ${source} address for client ${clientId}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to upsert ${source} address for client ${clientId}: ${(error as Error).message}`,
      );
    }
  }

  private async upsertContact(
    clientId: string,
    source: string,
    contactData: NonNullable<BureauEnrichmentData['contact']>,
    queriedAt: Date,
  ): Promise<void> {
    const hasData = Object.values(contactData).some((v) => v != null && v !== '');
    if (!hasData) {
      this.logger.debug(`No contact data from ${source} for client ${clientId}, skipping`);
      return;
    }

    try {
      const existing = await this.contactRepository.findByClientAndSource(clientId, source);

      if (existing) {
        await this.contactRepository.update(existing.id, {
          phone: contactData.phone,
          email: contactData.email,
          sourceQueriedAt: queriedAt,
        });
        this.logger.debug(`Updated ${source} contact for client ${clientId}`);
      } else {
        const contact = ClientContact.create({
          clientId,
          contactName: `Contato ${source.toUpperCase()}`,
          useType: 'commercial',
          email: contactData.email,
          emailSecondary: null,
          phone: contactData.phone,
          phoneMobile: null,
          phoneSms: null,
          whatsapp: false,
          homepage: null,
          notes: null,
          source,
          sourceQueriedAt: queriedAt,
          isPrimary: false,
          isActive: true,
        });
        await this.contactRepository.save(contact);
        this.logger.debug(`Created ${source} contact for client ${clientId}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to upsert ${source} contact for client ${clientId}: ${(error as Error).message}`,
      );
    }
  }

  private async upsertPartners(
    clientId: string,
    source: string,
    partners: BureauPartnerData[],
    queriedAt: Date,
  ): Promise<void> {
    try {
      const allExistingPersons = await this.authorizedPersonRepository.findAllByClientId(clientId);
      const sourcePersons = allExistingPersons.filter((p) => p.source === source);

      const incomingCpfs = new Set(
        partners.filter((p) => p.cpf).map((p) => p.cpf!.replaceAll(/\D/g, '')),
      );
      const incomingCnpjs = new Set(
        partners.filter((p) => p.cnpj).map((p) => p.cnpj!.replaceAll(/\D/g, '')),
      );

      for (const partner of partners) {
        await this.processPartner(clientId, source, partner, queriedAt, allExistingPersons, sourcePersons);
      }

      await this.deactivateRemovedPartners(source, sourcePersons, partners, incomingCpfs, incomingCnpjs, clientId);
    } catch (error) {
      this.logger.error(
        `Failed to upsert ${source} partners for client ${clientId}: ${(error as Error).message}`,
      );
    }
  }

  private async processPartner(
    clientId: string,
    source: string,
    partner: BureauPartnerData,
    queriedAt: Date,
    allExistingPersons: ClientAuthorizedPerson[],
    sourcePersons: ClientAuthorizedPerson[],
  ): Promise<void> {
    const isPj = !partner.cpf && !!partner.cnpj;
    const cleanCpf = partner.cpf?.replaceAll(/\D/g, '') || null;
    const cleanCnpj = partner.cnpj?.replaceAll(/\D/g, '') || null;
    const identifier = isPj ? cleanCnpj : cleanCpf;

    const sameSourceMatch = this.findByIdentifier(sourcePersons, identifier, isPj, partner.fullName);
    if (sameSourceMatch) {
      await this.authorizedPersonRepository.update(sameSourceMatch.id, {
        fullName: partner.fullName,
        authorizationType: partner.authorizationType,
        phone: partner.phone,
        email: partner.email,
        joinedAt: partner.joinedAt,
        mandateEndAt: partner.mandateEndAt,
        role: partner.role,
        participationPercentage: partner.participationPercentage,
        capitalTotalValue: partner.capitalTotalValue,
        restrictionSign: partner.restrictionSign,
        sourceQueriedAt: queriedAt,
        isActive: true,
      });
      this.logger.debug(`Updated ${source} partner ${partner.fullName} for client ${clientId}`);
      return;
    }

    const otherSourceMatch = identifier
      ? this.findByIdentifier(allExistingPersons, identifier, isPj, null)
      : null;

    if (otherSourceMatch) {
      this.logger.debug(
        `Partner ${partner.fullName} already exists from source "${otherSourceMatch.source}", skipping creation for ${source}`,
      );
      return;
    }

    const person = ClientAuthorizedPerson.create({
      clientId,
      authorizationType: partner.authorizationType,
      fullName: partner.fullName,
      personType: isPj ? 'pj' : 'pf',
      cpf: cleanCpf,
      cnpj: cleanCnpj,
      linkedClientId: null,
      phone: partner.phone,
      email: partner.email,
      joinedAt: partner.joinedAt,
      mandateEndAt: partner.mandateEndAt,
      role: partner.role,
      participationPercentage: partner.participationPercentage,
      capitalTotalValue: partner.capitalTotalValue,
      restrictionSign: partner.restrictionSign,
      source,
      sourceQueriedAt: queriedAt,
      isActive: true,
    });
    const saved = await this.authorizedPersonRepository.save(person);
    this.logger.debug(`Created ${source} partner ${partner.fullName} for client ${clientId}`);

    if (isPj && cleanCnpj) {
      this.eventEmitter.emit(
        PartnerCompanyDetectedEvent.EVENT_NAME,
        new PartnerCompanyDetectedEvent(clientId, saved.id, cleanCnpj, partner.fullName),
      );
      this.logger.log(`Emitted PartnerCompanyDetectedEvent for CNPJ ${cleanCnpj}`);
    }
  }

  private findByIdentifier(
    persons: ClientAuthorizedPerson[],
    identifier: string | null,
    isPj: boolean,
    fallbackName: string | null,
  ): ClientAuthorizedPerson | undefined {
    if (!identifier) {
      return fallbackName ? persons.find((e) => e.fullName === fallbackName) : undefined;
    }
    return persons.find((e) => {
      const eId = isPj ? e.cnpj?.replaceAll(/\D/g, '') : e.cpf?.replaceAll(/\D/g, '');
      return eId === identifier;
    });
  }

  private async deactivateRemovedPartners(
    source: string,
    sourcePersons: ClientAuthorizedPerson[],
    partners: BureauPartnerData[],
    incomingCpfs: Set<string>,
    incomingCnpjs: Set<string>,
    clientId: string,
  ): Promise<void> {
    for (const existing of sourcePersons) {
      if (!existing.isActive) continue;
      const isPjExisting = existing.personType === 'pj';
      const existingId = isPjExisting
        ? existing.cnpj?.replaceAll(/\D/g, '') || null
        : existing.cpf?.replaceAll(/\D/g, '') || null;

      let stillPresent: boolean;
      if (!existingId) {
        stillPresent = partners.some((p) => p.fullName === existing.fullName);
      } else if (isPjExisting) {
        stillPresent = incomingCnpjs.has(existingId);
      } else {
        stillPresent = incomingCpfs.has(existingId);
      }

      if (!stillPresent) {
        await this.authorizedPersonRepository.update(existing.id, { isActive: false });
        this.logger.debug(`Deactivated ${source} partner ${existing.fullName} for client ${clientId}`);
      }
    }
  }
}
