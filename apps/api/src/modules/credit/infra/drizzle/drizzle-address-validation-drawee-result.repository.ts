import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { AddressValidationDraweeResultRepository } from '../../domain/address-validation-drawee-result.repository';
import { AddressValidationDraweeResult } from '../../domain/address-validation-drawee-result.entity';
import { addressValidationDraweeResults } from '../../../../database/schema/address-validation-drawee-results';
import { AddressValidationDraweeResultMapper } from '../mappers/address-validation-drawee-result.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';

@Injectable()
export class DrizzleAddressValidationDraweeResultRepository implements AddressValidationDraweeResultRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(result: AddressValidationDraweeResult): Promise<void> {
    const raw = AddressValidationDraweeResultMapper.toPersistence(result);
    await this.db.insert(addressValidationDraweeResults).values(raw);
  }

  async getLatestByDraweeId(draweeId: string): Promise<AddressValidationDraweeResult[]> {
    const rows = await this.db
      .select()
      .from(addressValidationDraweeResults)
      .where(eq(addressValidationDraweeResults.draweeId, draweeId))
      .orderBy(desc(addressValidationDraweeResults.queriedAt));

    return rows.map((r) => AddressValidationDraweeResultMapper.toDomain(r));
  }
}
