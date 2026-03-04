import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { AddressValidationRepository } from '../../domain/address-validation.repository';
import { AddressValidationResult } from '../../domain/address-validation-result.entity';
import { addressValidationResults } from '../../../../database/schema/address-validation-results';
import { AddressValidationResultMapper } from '../mappers/address-validation-result.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';

@Injectable()
export class DrizzleAddressValidationRepository implements AddressValidationRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(result: AddressValidationResult): Promise<void> {
    const raw = AddressValidationResultMapper.toPersistence(result);
    await this.db.insert(addressValidationResults).values(raw).execute();
  }

  async getLatestByClientId(clientId: string): Promise<AddressValidationResult | null> {
    const rows = await this.db
      .select()
      .from(addressValidationResults)
      .where(eq(addressValidationResults.clientId, clientId))
      .orderBy(desc(addressValidationResults.queriedAt))
      .limit(1)
      .execute();

    const row = rows[0];
    if (!row) {
      return null;
    }

    return AddressValidationResultMapper.toDomain(row);
  }
}
