import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DigitalPresenceRepository } from '../../domain/digital-presence.repository';
import { DigitalPresenceResult } from '../../domain/digital-presence-result.entity';
import { digitalPresenceResults } from '../../../../database/schema/digital-presence-results';
import { DigitalPresenceResultMapper } from '../mappers/digital-presence-result.mapper';
import { DRIZZLE, type DrizzleDB } from '../../../../database/database.module';

@Injectable()
export class DrizzleDigitalPresenceRepository implements DigitalPresenceRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB,
  ) {}

  async save(result: DigitalPresenceResult): Promise<void> {
    const raw = DigitalPresenceResultMapper.toPersistence(result);
    await this.db.insert(digitalPresenceResults).values(raw).execute();
  }

  async getLatestByClientId(clientId: string): Promise<DigitalPresenceResult | null> {
    const rows = await this.db
      .select()
      .from(digitalPresenceResults)
      .where(eq(digitalPresenceResults.clientId, clientId))
      .orderBy(desc(digitalPresenceResults.queriedAt))
      .limit(1)
      .execute();

    return rows.length > 0 ? DigitalPresenceResultMapper.toDomain(rows[0]!) : null;
  }
}
