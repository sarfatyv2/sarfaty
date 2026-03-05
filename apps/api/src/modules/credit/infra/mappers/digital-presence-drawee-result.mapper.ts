import { type digitalPresenceDraweeResults } from '../../../../database/schema/digital-presence-drawee-results';
import { DigitalPresenceDraweeResult, type EmailType } from '../../domain/digital-presence-drawee-result.entity';

type DrizzleRow = typeof digitalPresenceDraweeResults.$inferSelect;
type InsertRow = typeof digitalPresenceDraweeResults.$inferInsert;

export class DigitalPresenceDraweeResultMapper {
  static toDomain(raw: DrizzleRow): DigitalPresenceDraweeResult {
    return DigitalPresenceDraweeResult.reconstitute({
      id: raw.id,
      draweeId: raw.draweeId,
      domain: raw.domain,
      emailType: raw.emailType as EmailType,
      hasDns: raw.hasDns,
      hasActiveSite: raw.hasActiveSite,
      siteTitle: raw.siteTitle,
      rawData: raw.rawData as Record<string, unknown> | null,
      queriedAt: raw.queriedAt,
    });
  }

  static toPersistence(entity: DigitalPresenceDraweeResult): InsertRow {
    return {
      id: entity.id || undefined,
      draweeId: entity.draweeId,
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
