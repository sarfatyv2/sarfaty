import { Inject, Injectable, Logger } from '@nestjs/common';
import { DRAWEE_ADDRESS_REPOSITORY, type DraweeAddressRepository } from '../infra/drizzle-drawee-address.repository';
import { DRAWEE_CONTACT_REPOSITORY, type DraweeContactRepository } from '../infra/drizzle-drawee-contact.repository';
import { draweeAddresses, draweeContacts } from '../../../database/schema';

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
  ) {}

  async execute(input: EnrichDraweeFromBureauInput): Promise<void> {
    const { draweeId, source, data } = input;

    await Promise.allSettled([
      data.address ? this.upsertAddress(draweeId, source, data.address) : Promise.resolve(),
      data.contact ? this.upsertContact(draweeId, source, data.contact) : Promise.resolve(),
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
}
