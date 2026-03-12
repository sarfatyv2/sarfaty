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
      data.address ? this.upsertAddress(draweeId, source, data.address, now) : Promise.resolve(),
      data.contact ? this.upsertContact(draweeId, source, data.contact, now) : Promise.resolve(),
      data.partners?.length ? this.upsertPartners(draweeId, source, data.partners, now) : Promise.resolve(),
    ]);
  }

  private async upsertAddress(
    draweeId: string,
    source: string,
    addressData: NonNullable<BureauEnrichmentData['address']>,
    queriedAt: Date,
  ): Promise<void> {
    const hasData = Object.values(addressData).some((v) => v != null && v !== '');
    if (!hasData) {
      this.logger.debug(`No address data from ${source} for drawee ${draweeId}, skipping`);
      return;
    }

    try {
      const existing = await this.addressRepository.findByDraweeAndSource(draweeId, source);

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
        this.logger.debug(`Updated ${source} address for drawee ${draweeId}`);
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
          source,
          sourceQueriedAt: queriedAt,
          isPrimary: false,
          isActive: true,
        } as typeof draweeAddresses.$inferInsert);
        this.logger.debug(`Created ${source} address for drawee ${draweeId}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to upsert ${source} address for drawee ${draweeId}: ${(error as Error).message}`,
      );
    }
  }

  private async upsertContact(
    draweeId: string,
    source: string,
    contactData: NonNullable<BureauEnrichmentData['contact']>,
    queriedAt: Date,
  ): Promise<void> {
    const hasData = Object.values(contactData).some((v) => v != null && v !== '');
    if (!hasData) {
      this.logger.debug(`No contact data from ${source} for drawee ${draweeId}, skipping`);
      return;
    }

    try {
      const existing = await this.contactRepository.findByDraweeAndSource(draweeId, source);

      if (existing) {
        await this.contactRepository.update(existing.id, {
          phone: contactData.phone,
          email: contactData.email,
          sourceQueriedAt: queriedAt,
        });
        this.logger.debug(`Updated ${source} contact for drawee ${draweeId}`);
      } else {
        await this.contactRepository.save({
          draweeId,
          contactName: `Contato ${source.toUpperCase()}`,
          useType: 'commercial',
          email: contactData.email,
          phone: contactData.phone,
          source,
          sourceQueriedAt: queriedAt,
          isPrimary: false,
          isActive: true,
        } as typeof draweeContacts.$inferInsert);
        this.logger.debug(`Created ${source} contact for drawee ${draweeId}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to upsert ${source} contact for drawee ${draweeId}: ${(error as Error).message}`,
      );
    }
  }

  private async upsertPartners(
    draweeId: string,
    source: string,
    partners: BureauPartnerData[],
    queriedAt: Date,
  ): Promise<void> {
    try {
      // Search all existing persons (regardless of source) to avoid duplicates by CPF
      const allExistingPersons = await this.authorizedPersonRepository.findAllByDraweeId(draweeId);
      const sourcePersons = allExistingPersons.filter((p) => p.source === source);

      const incomingCpfs = new Set(
        partners.filter((p) => p.cpf).map((p) => p.cpf!.replaceAll(/\D/g, '')),
      );

      for (const partner of partners) {
        const cleanCpf = partner.cpf?.replaceAll(/\D/g, '') || null;

        // Check if a record already exists for this source
        const sameSourceMatch = cleanCpf
          ? sourcePersons.find((e) => e.cpf?.replaceAll(/\D/g, '') === cleanCpf)
          : sourcePersons.find((e) => e.fullName === partner.fullName);

        if (sameSourceMatch) {
          // Update existing record from the same source
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
          this.logger.debug(`Updated ${source} partner ${partner.fullName} for drawee ${draweeId}`);
          continue;
        }

        // Check if same CPF exists from a different source — skip creation to avoid duplicates
        const otherSourceMatch = cleanCpf
          ? allExistingPersons.find((e) => e.cpf?.replaceAll(/\D/g, '') === cleanCpf)
          : null;

        if (otherSourceMatch) {
          this.logger.debug(
            `Partner ${partner.fullName} (CPF ${cleanCpf}) already exists from source "${otherSourceMatch.source}", skipping creation for ${source}`,
          );
          continue;
        }

        const person = DraweeAuthorizedPerson.create({
          draweeId,
          authorizationType: partner.authorizationType,
          fullName: partner.fullName,
          cpf: cleanCpf,
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
        await this.authorizedPersonRepository.save(person);
        this.logger.debug(`Created ${source} partner ${partner.fullName} for drawee ${draweeId}`);
      }

      // Deactivate only persons from this source that are no longer in the response
      for (const existing of sourcePersons) {
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
