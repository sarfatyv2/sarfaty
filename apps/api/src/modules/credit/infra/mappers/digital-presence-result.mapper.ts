import { type digitalPresenceResults } from '../../../../database/schema/digital-presence-results';
import { DigitalPresenceResult, type EmailType } from '../../domain/digital-presence-result.entity';

type DrizzleDigitalPresenceResult = typeof digitalPresenceResults.$inferSelect;
type InsertDigitalPresenceResult = typeof digitalPresenceResults.$inferInsert;

export class DigitalPresenceResultMapper {
  static toDomain(raw: DrizzleDigitalPresenceResult): DigitalPresenceResult {
    return DigitalPresenceResult.reconstitute({
      id: raw.id,
      clientId: raw.clientId,
      domain: raw.domain,
      emailType: raw.emailType as EmailType,
      hasDns: raw.hasDns,
      hasActiveSite: raw.hasActiveSite,
      siteTitle: raw.siteTitle,
      rawData: raw.rawData as Record<string, unknown> | null,
      queriedAt: raw.queriedAt,
    });
  }

  static toPersistence(entity: DigitalPresenceResult): InsertDigitalPresenceResult {
    return {
      id: entity.id || undefined,
      clientId: entity.clientId,
      domain: entity.domain,
      emailType: entity.emailType,
      hasDns: entity.hasDns,
      hasActiveSite: entity.hasActiveSite,
      siteTitle: entity.siteTitle,
      rawData: entity.rawData,
      queriedAt: entity.queriedAt,
    };
  }
}
