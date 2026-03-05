import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DigitalPresenceDraweeResultRepository } from '../../domain/digital-presence-drawee-result.repository';
import { DigitalPresenceDraweeResult } from '../../domain/digital-presence-drawee-result.entity';
import { digitalPresenceDraweeResults } from '../../../../database/schema/digital-presence-drawee-results';
import { DigitalPresenceDraweeResultMapper } from '../mappers/digital-presence-drawee-result.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';

@Injectable()
export class DrizzleDigitalPresenceDraweeResultRepository implements DigitalPresenceDraweeResultRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(result: DigitalPresenceDraweeResult): Promise<void> {
    const raw = DigitalPresenceDraweeResultMapper.toPersistence(result);
    await this.db.insert(digitalPresenceDraweeResults).values(raw);
  }

  async getLatestByDraweeId(draweeId: string): Promise<DigitalPresenceDraweeResult[]> {
    const rows = await this.db
      .select()
      .from(digitalPresenceDraweeResults)
      .where(eq(digitalPresenceDraweeResults.draweeId, draweeId))
      .orderBy(desc(digitalPresenceDraweeResults.queriedAt));

    return rows.map((r) => DigitalPresenceDraweeResultMapper.toDomain(r));
  }
}
