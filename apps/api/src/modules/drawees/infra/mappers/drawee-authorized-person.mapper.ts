import { DraweeAuthorizedPerson, type DraweeAuthorizedPersonProps } from '../../domain/drawee-authorized-person.entity';
import type { draweeAuthorizedPersons } from '../../../../database/schema';

type Row = typeof draweeAuthorizedPersons.$inferSelect;

export class DraweeAuthorizedPersonMapper {
  static toDomain(row: Row): DraweeAuthorizedPerson {
    const props: DraweeAuthorizedPersonProps = {
      id: row.id,
      draweeId: row.draweeId,
      authorizationType: row.authorizationType,
      fullName: row.fullName,
      cpf: row.cpf,
      phone: row.phone,
      email: row.email,
      source: row.source,
      sourceQueriedAt: row.sourceQueriedAt,
      joinedAt: row.joinedAt ?? null,
      mandateEndAt: row.mandateEndAt ?? null,
      role: row.role ?? null,
      participationPercentage: row.participationPercentage ?? null,
      capitalTotalValue: row.capitalTotalValue ?? null,
      restrictionSign: row.restrictionSign ?? null,
      isActive: row.isActive ?? true,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    return DraweeAuthorizedPerson.reconstitute(props);
  }

  static toPersistence(person: DraweeAuthorizedPerson): Record<string, unknown> {
    return {
      draweeId: person.draweeId,
      authorizationType: person.authorizationType,
      fullName: person.fullName,
      cpf: person.cpf,
      phone: person.phone,
      email: person.email,
      source: person.source,
      sourceQueriedAt: person.sourceQueriedAt,
      joinedAt: person.joinedAt,
      mandateEndAt: person.mandateEndAt,
      role: person.role,
      participationPercentage: person.participationPercentage,
      capitalTotalValue: person.capitalTotalValue,
      restrictionSign: person.restrictionSign,
      isActive: person.isActive,
    };
  }
}
