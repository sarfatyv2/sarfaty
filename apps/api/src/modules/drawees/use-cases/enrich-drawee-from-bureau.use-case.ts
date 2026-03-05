import { Inject, Injectable, Logger } from '@nestjs/common';
import { DRAWEE_ADDRESS_REPOSITORY, type DraweeAddressRepository } from '../infra/drizzle-drawee-address.repository';
import { DRAWEE_CONTACT_REPOSITORY, type DraweeContactRepository } from '../infra/drizzle-drawee-contact.repository';
import { DRAWEE_AUTHORIZED_PERSON_REPOSITORY, type DraweeAuthorizedPersonRepository } from '../domain/drawee-authorized-person.repository';
import { DraweeAuthorizedPerson } from '../domain/drawee-authorized-person.entity';
import { draweeAddresses, draweeContacts } from '../../../database/schema';

export interface BureauPartnerData {
  fullName: string;
  cpf: string | null;
  authorizationType: string;
  phone: string | null;
  email: string | null;
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

export interface EnrichDraweeFromBureauInput {
  draweeId: string;
  source: string;
  data: BureauEnrichmentData;
}

@Injectable()
export class EnrichDraweeFromBureauUseCase {
  private readonly logger = new Logger(EnrichDraweeFromBureauUseCase.name);

  constructor(
    @Inject(DRAWEE_ADDRESS_REPOSITORY)
    private readonly addressRepository: DraweeAddressRepository,
    @Inject(DRAWEE_CONTACT_REPOSITORY)
    private readonly contactRepository: DraweeContactRepository,
    @Inject(DRAWEE_AUTHORIZED_PERSON_REPOSITORY)
    private readonly authorizedPersonRepository: DraweeAuthorizedPersonRepository,
  ) {}

  async execute(input: EnrichDraweeFromBureauInput): Promise<void> {
    const { draweeId, source, data } = input;
    const now = new Date();

    await Promise.allSettled([
      data.address ? this.upsertAddress(draweeId, source, data.address) : Promise.resolve(),
      data.contact ? this.upsertContact(draweeId, source, data.contact) : Promise.resolve(),
      data.partners?.length ? this.upsertPartners(draweeId, source, data.partners, now) : Promise.resolve(),
    ]);
  }

  private async upsertAddress(
    draweeId: string,
    _source: string,
    addressData: NonNullable<BureauEnrichmentData['address']>,
  ): Promise<void> {
    const hasData = Object.values(addressData).some((v) => v != null && v !== '');
    if (!hasData) {
      this.logger.debug(`No address data for drawee ${draweeId}, skipping`);
      return;
    }

    try {
      const existing = await this.addressRepository.findAllByDraweeId(draweeId);
      const primaryOrFirst = existing.find((a) => a.isPrimary) ?? existing[0];

      if (primaryOrFirst) {
        await this.addressRepository.update(primaryOrFirst.id, {
          street: addressData.street,
          number: addressData.number,
          complement: addressData.complement,
          neighborhood: addressData.neighborhood,
          city: addressData.city,
          state: addressData.state,
          zipCode: addressData.zipCode,
        });
        this.logger.debug(`Updated address for drawee ${draweeId}`);
      } else {
        await this.addressRepository.save({
          draweeId,
          useType: 'commercial',
          street: addressData.street,
          number: addressData.number,
          withoutNumber: false,
          complement: addressData.complement,
          neighborhood: addressData.neighborhood,
          zipCode: addressData.zipCode,
          city: addressData.city,
          state: addressData.state,
          isPrimary: true,
          isActive: true,
        } as typeof draweeAddresses.$inferInsert);
        this.logger.debug(`Created address for drawee ${draweeId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to upsert address for drawee ${draweeId}: ${(error as Error).message}`);
    }
  }

  private async upsertContact(
    draweeId: string,
    _source: string,
    contactData: NonNullable<BureauEnrichmentData['contact']>,
  ): Promise<void> {
    const hasData = Object.values(contactData).some((v) => v != null && v !== '');
    if (!hasData) {
      this.logger.debug(`No contact data for drawee ${draweeId}, skipping`);
      return;
    }

    try {
      const existing = await this.contactRepository.findAllByDraweeId(draweeId);
      const primaryOrFirst = existing.find((c) => c.isPrimary) ?? existing[0];

      if (primaryOrFirst) {
        await this.contactRepository.update(primaryOrFirst.id, {
          phone: contactData.phone,
          email: contactData.email,
        });
        this.logger.debug(`Updated contact for drawee ${draweeId}`);
      } else {
        await this.contactRepository.save({
          draweeId,
          contactName: 'Contato principal',
          useType: 'commercial',
          email: contactData.email,
          phone: contactData.phone,
          isPrimary: true,
          isActive: true,
        } as typeof draweeContacts.$inferInsert);
        this.logger.debug(`Created contact for drawee ${draweeId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to upsert contact for drawee ${draweeId}: ${(error as Error).message}`);
    }
  }

  private async upsertPartners(
    draweeId: string,
    source: string,
    partners: BureauPartnerData[],
    queriedAt: Date,
  ): Promise<void> {
    try {
      const existingPersons = await this.authorizedPersonRepository.findByDraweeAndSource(draweeId, source);
      const incomingCpfs = new Set(
        partners.filter((p) => p.cpf).map((p) => p.cpf!.replaceAll(/\D/g, '')),
      );

      for (const partner of partners) {
        const cleanCpf = partner.cpf?.replaceAll(/\D/g, '') || null;
        const match = cleanCpf
          ? existingPersons.find((e) => e.cpf?.replaceAll(/\D/g, '') === cleanCpf)
          : existingPersons.find((e) => e.fullName === partner.fullName);

        if (match) {
          await this.authorizedPersonRepository.update(match.id, {
            fullName: partner.fullName,
            authorizationType: partner.authorizationType,
            phone: partner.phone,
            email: partner.email,
            sourceQueriedAt: queriedAt,
            isActive: true,
          });
          this.logger.debug(`Updated ${source} partner ${partner.fullName} for drawee ${draweeId}`);
        } else {
          const person = DraweeAuthorizedPerson.create({
            draweeId,
            authorizationType: partner.authorizationType,
            fullName: partner.fullName,
            cpf: cleanCpf,
            phone: partner.phone,
            email: partner.email,
            source,
            sourceQueriedAt: queriedAt,
            isActive: true,
          });
          await this.authorizedPersonRepository.save(person);
          this.logger.debug(`Created ${source} partner ${partner.fullName} for drawee ${draweeId}`);
        }
      }

      for (const existing of existingPersons) {
        if (!existing.isActive) continue;
        const existingCleanCpf = existing.cpf?.replaceAll(/\D/g, '') || null;
        const stillPresent = existingCleanCpf
          ? incomingCpfs.has(existingCleanCpf)
          : partners.some((p) => p.fullName === existing.fullName);
        if (!stillPresent) {
          await this.authorizedPersonRepository.update(existing.id, { isActive: false });
          this.logger.debug(`Deactivated ${source} partner ${existing.fullName} for drawee ${draweeId}`);
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to upsert ${source} partners for drawee ${draweeId}: ${(error as Error).message}`,
      );
    }
  }
}
